import { Table } from "sst/node/table";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const client = new DynamoDBClient({});
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
      googleID: {
        type: "string",
        required: true,
      },
      userID: {
        type: "number",
        required: true,
      },
      email: {
        type: "string",
        required: true,
      },
      connectedScanners: {
        type: "set",
        items: "string",
        required: true,
      },
    },
    indexes: {
      byGoogleID: {
        collection: "google_user",
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["googleID"],
        },
        sk: {
          field: "gsi1sk",
          composite: [],
        },
      },
      byUserID: {
        collection: "uid",
        pk: {
          field: "pk",
          composite: ["userID"],
        },
        sk: {
          field: "sk",
          composite: [],
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
        type: "number",
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
              required: true,
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

export const SignInEntity = new Entity(
  {
    model: { entity: "SignIn", version: "1", service: "attendance" },
    attributes: {
      userID: {
        type: "number",
        required: true,
      },
      studentID: {
        type: "number",
        required: true,
      },
      scannerName: {
        type: "string",
        required: true,
      },
      time: {
        type: "number",
        required: true,
        default: () => Date.now(),
        readOnly: true,
      },
      signInID: {
        type: "string",
        required: true,
      },
    },
    indexes: {
      signins: {
        pk: {
          field: "pk",
          composite: ["userID"],
        },
        sk: {
          field: "sk",
          composite: ["time", "scannerName"],
        },
      },
      // byStudentId: {
      //   index: "gsi1",
      //   pk: {
      //     field: "gsi1pk",
      //     composite: ["userID", "scannerName", "studentID"],
      //   },
      //   sk: {
      //     field: "gsi1sk",
      //     composite: ["time"],
      //   },
      // },
    },
  },
  { client, table: tableName }
);

export const ConnectionEntity = new Entity(
  {
    model: { entity: "Connections", version: "1", service: "attendance" },
    attributes: {
      connectionID: {
        type: "string",
        required: true,
      },
      userID: {
        type: "number",
        required: true,
      },
    },
    indexes: {
      connections: {
        pk: {
          field: "pk",
          composite: ["userID"],
        },
        sk: {
          field: "sk",
          composite: ["connectionID"],
        },
      },
      id: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["connectionID"],
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

export const UnauthedConnectionEntity = new Entity(
  {
    model: {
      entity: "UnauthedConnections",
      version: "1",
      service: "attendance",
    },
    attributes: {
      connectionID: {
        type: "string",
        required: true,
      },
      connectionDate: {
        type: "number",
        required: true,
      },
    },
    indexes: {
      date: {
        pk: {
          field: "pk",
          composite: ["connectionDate"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
      id: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["connectionID"],
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
//   model: { entity: "Scanner", version: "1", service: "attendance" },
//   attributes: {
//     scannerName: {
//       type: "string",
//       required: true,
//     },
//     pairedUserID: {
//       type: "number",
//     },
//     lastConnected: {
//       type: "number",
//       required: true,
//       default: () => Date.now(),
//     },
//   },
//   indexes: {
//     byName: {
//       pk: {
//         field: "pk",
//         composite: ["scannerName"],
//       },
//       sk: {
//         field: "sk",
//         composite: ["lastConnected"],
//       },
//     },
//     byUID: {
//       index: "gsi1",
//       pk: {
//         field: "gsi1pk",
//         composite: ["pairedUserID"],
//       },
//       sk: {
//         field: "gsi1sk",
//         composite: ["scannerName"],
//       },
//     },
//   },
// });
