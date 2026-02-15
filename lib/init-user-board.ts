import connectDB from "./db";
import { Board, Column } from "./models";

const DEFAULT_COLS = [
  { name: "Wishlist", order: 0 },
  { name: "Applied", order: 1 },
  { name: "Interviewing", order: 2 },
  { name: "Offer", order: 3 },
  { name: "Rejected", order: 4 },
]

export async function initUserBoard(userId: string) {
  try {
    await connectDB()
    // check if board exits already
    const existingBoard = await Board.findOne({ userId, name: "Job Hunt" });
    if (existingBoard) {
      return existingBoard;
    }
    
    
    // create the default board
    const board = await Board.create({
      name: "Job Hunt",
      userId,
      columns: []
    })
    
    // create default columns
    const columns = await Promise.all(DEFAULT_COLS.map((col) => Column.create({
      name: col.name,
      order: col.order,
      boardId: board._id,
      jobApplications: [],
    })))
    
    board.columns = columns.map((col) => col._id);
    await board.save()
  } catch (err) {
    throw err
  }
}