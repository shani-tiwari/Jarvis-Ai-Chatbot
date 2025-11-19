// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const chatgptIndex = pc.Index('chatgpt');

async function createMemory( {vectors, metadata, messageId} ) {
    await chatgptIndex.upsert([{
        id: messageId,
        values: vectors,
        metadata
    }]);
};

async function queryMemory({queryVector, limit = 3, metadata}) {
    // console.log(metadata);
    const data = await chatgptIndex.query({
        vector: queryVector,
        topK: limit,
        filter:  metadata || undefined,
        includeMetadata: true
    });
    // console.log(metadata);
    return data.matches;
};

module.exports = {
    createMemory,
    queryMemory
};




// // Create a dense index with integrated embedding
// const indexName = 'quickstart-js';

// await pc.createIndexForModel({
//   name: indexName,
//   cloud: 'aws',
//   region: 'us-east-1',
//   embed: {
//     model: 'llama-text-embed-v2',
//     fieldMap: { text: 'chunk_text' },
//   },
//   waitUntilReady: true,
// });