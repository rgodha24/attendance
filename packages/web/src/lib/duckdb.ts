export async function getSignins({
  start,
  end = new Date(),
  scannerName,
}: {
  start: Date;
  end: Date;
  scannerName: string;
}): Promise<SignIn[]> {
  const db = await getDB();
  const conn = await db.connect();
  const result = await conn.query(
    `SELECT * FROM signins WHERE date >= '${start.toISOString()}' AND date <= '${end.toISOString()}' AND scanner_name = '${scannerName}'`
  );
  console.log(result);

  await conn.close();

  return result.toArray();
}

export async function addSignin({ date, scanner_name, studentID, id }: SignIn) {
  const db = await getDB();
  const conn = await db.connect();

  await conn.query(
    `INSERT INTO signins VALUES ('${id}', ${studentID}, '${date.toISOString()}', '${scanner_name}')`
  );

  await conn.close();

  // TODO: save to indexed db too
}

export type SignIn = {
  studentID: number;
  id: string;
  date: Date;
  scanner_name: string;
};

export { getDB as getdb };
