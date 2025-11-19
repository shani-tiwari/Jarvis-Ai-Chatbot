const { Server } = require("socket.io");
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const { generateResponse, generateVector } = require("../services/ai.service")
const { createMemory, queryMemory } = require("../services/vector.service")



function initSocketServer(httpServer) {

    
    const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://jarvis-ai-chatbot.onrender.com",
        "https://jarvis-ai-chatbot-backend.onrender.com",
    ];

    const io = new Server(httpServer, {
        cors: { 
            origin: allowedOrigins,
            credentials: true
         }
    });

    io.use(async (socket, next) => {

        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

        if (!cookies.token) next(new Error("Authentication error: No token provided"));

        try {

            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.id);
            socket.user = user;
            next();

        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }

    })

    io.on("connection", (socket) => {

        socket.on("ai-message", async (messagePayload) => { 

            /* messagePayload = { chat:chatId, content:message text } */

            // const message = await messageModel.create({
            //     chat: messagePayload.chat,
            //     user: socket.user._id,
            //     content: messagePayload.content,
            //     role: "user"
            // });
            // const vectors = await generateVector(messagePayload.content);
            // await createMemory({
            //     vectors,
            //     messageId: message._id,
            //     metadata: {
            //         chat: messagePayload.chat,
            //         user: socket.user._id,
            //         text: messagePayload.content
            //     }
            // });


            const [message, vectors] = await Promise.all([ 
                messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: messagePayload.content,
                    role: "user"
                })
                , 
                generateVector(messagePayload.content)
            ]);  // optimization -> all tasks start together(independent tasks)
            
            await createMemory({
                vectors,
                messageId: message._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: messagePayload.content
                }
            });


            /*const memory = await queryMemory({
                queryVector: vectors,
                limit: 3,
                metadata: {}
            });
            const chatHistory = (await messageModel.find({
                chat: messagePayload.chat
            }).sort({ createdAt: -1 }).limit(20).lean()).reverse(); */

            const [memory, chatHistory] = await Promise.all([
                 queryMemory({
                    queryVector: vectors,
                    limit: 3,
                    metadata: {chatId: messageModel.chat}
                 })
                , 
                messageModel.find({
                    chat: messagePayload.chat
                }).sort({ createdAt: -1 }).limit(20).lean().then(result => result.reverse())
            ])




            const shortTermMemory = chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [{text: item.content}]
                }
            });

            const longTermMemory = [{
                role: "user",
                parts: [{text: `
                         these are some previous messages, use them to generate response
                            ${
                                memory.map(item => item.metadata.text ).join("\n")
                            } 
                      `}]
            }]; 

            const response = await generateResponse([...longTermMemory, ...shortTermMemory ]);

            socket.emit('ai-response', {
                content: response,
                chat: messagePayload.chat
            });

            /*const responseMessage = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                content: response,
                role: "model"
            }); 
            const responseVectors = await generateVector(response); */

            const [responseMessage, responseVectors] = await Promise.all([
                messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    content: response,
                    role: "model"
                }) 
                ,
                generateVector(response)
            ])

            await createMemory({
                vectors: responseVectors,
                messageId: responseMessage._id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: response
                }
            });


        })

    })
}


module.exports = initSocketServer;