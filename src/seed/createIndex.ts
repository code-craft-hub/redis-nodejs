import { SCHEMA_FIELD_TYPE } from "redis";
import { initializeRedisClient } from "../utils/client";
import { indexKey, getKeyName } from "../utils/keys";

async function createIndex() {
  const client = await initializeRedisClient();
  
  try {
    // Try to drop the index if it exists, but don't fail if it doesn't
    await client.ft.dropIndex(indexKey);
    console.log(`Dropped existing index: ${indexKey}`);
  } catch (error: any) {
    // This is expected if the index doesn't exist yet
    if (error.message && error.message.includes('no such index')) {
      console.log(`Index ${indexKey} doesn't exist yet, proceeding to create it`);
    } else {
      // Log unexpected errors but continue
      console.error('Unexpected error while dropping index:', error.message);
    }
  }

  try {
    await client.ft.create(
      indexKey,
      {
        // Note: Using proper field path syntax for the schema
        id: {
          type: SCHEMA_FIELD_TYPE.TEXT,
          AS: "id",
        },
        name: {
          type: SCHEMA_FIELD_TYPE.TEXT,
          AS: "name",
        },
        avgStars: {
          type: SCHEMA_FIELD_TYPE.NUMERIC,
          AS: "avgStars",
          SORTABLE: true,
        },
      },
      {
        ON: "HASH", // or "JSON" if you're using JSON documents
        PREFIX: getKeyName("restaurants"),
      }
    );
    
    console.log(`Successfully created index: ${indexKey}`);
    console.log(`Prefix: ${getKeyName("restaurants")}`);
    
  } catch (error) {
    console.error('Error creating index:', error);
    throw error; // Re-throw to handle at higher level
  } finally {
    // Always close the connection
    await client.quit();
  }
}

// Better error handling for the main execution
(async () => {
  try {
    await createIndex();
    console.log('Index creation completed successfully');
  } catch (error) {
    console.error('Failed to create index:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();