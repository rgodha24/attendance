import { Table } from "sst/node/table";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const client = new DynamoDBClient();
const tableName = Table.electrodb.tableName;

import { Entity } from "electrodb";

export const UserEntity = new Entity(
  {
    model: {
      entity: "User",
      version: "1",
      service: "attendance",
    },
    attributes: {
      userID: {
        type: "string",
        required: true,
      },
      email: {
        type: "string",
        required: true,
      },
    },
    indexes: {
      byId: {
        collection: "attendance",
        pk: {
          field: "pk",
          composite: [],
        },
        sk: {
          field: "sk",
          composite: ["userID"],
        },
      },
    },
  },
  { client, table: tableName }
);

export const ClassEntity = new Entity(
  {
    model: {
      entity: "Class",
      version: "1",
      service: "attendance",
    },
    attributes: {
      classID: {
        type: "string",
        required: true,
      },
      userID: {
        type: "string",
        required: true,
      },
      students: {
        type: "list",
        items: {
          type: "map",
          properties: {
            name: {
              type: "string",
              required: true,
            },
            studentID: {
              type: "number",
              required: true,
            },
            email: {
              type: "string",
              required: false,
            },
          },
        },
        required: true,
      },
      // we want this to be a string for community periods + extracurriculars
      period: {
        type: "string",
        required: true,
      },
      // if it's the 2023-2024 school year, this would be 2023
      schoolYear: {
        type: "number",
        required: true,
      },
      semester: {
        type: ["fall", "spring", "other"] as const,
        required: true,
      },
      name: {
        type: "string",
        required: true,
      },
    },
    indexes: {
      classes: {
        collection: "classes",
        pk: {
          field: "pk",
          composite: ["userID"],
        },
        sk: {
          field: "sk",
          composite: ["classID"],
        },
      },
      byId: {
        collection: "class_id",
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["classID"],
        },
        sk: {
          field: "gsi1sk",
          composite: [],
        },
      },
    },
  },
  { client, table: tableName }
);

// export const ScannerEntity = new Entity({
//
// })
//
