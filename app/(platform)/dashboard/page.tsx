import KanbanBoard from "@/components/kanban/KanbanBoard";
import { getSession } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Board, JobApplication } from "@/lib/models";

async function getUserBoardData(userId: string) {
  await connectDB();

  const board = await Board.findOne({ userId })
    .populate({
      path: "columns",
      options: { sort: { order: 1 } },
      populate: {
        path: "jobApplications",
        model: "JobApplication",
        options: { sort: { order: 1 } },
      },
    })
    .lean();

  if (!board) return null;

  const serializeBoard = {
    ...board,
    _id: board._id.toString(),
    createdAt: board.createdAt?.toISOString(),
    updatedAt: board.updatedAt?.toISOString(),
    columns: board.columns.map((col: any) => ({
      ...col,
      _id: col._id.toString(),
      boardId: col.boardId.toString(),
      createdAt: col.createdAt?.toISOString(),
      updatedAt: col.updatedAt?.toISOString(),
      jobApplications: col.jobApplications.map((job: any) => ({
        ...job,
        _id: job._id.toString(),
        columnId: job.columnId.toString(),
        boardId: job.boardId.toString(),
        applicationDate: job.applicationDate?.toISOString(),
        createdAt: job.createdAt?.toISOString(),
        updatedAt: job.updatedAt?.toISOString(),
      })),
    })),
  };

  return serializeBoard;
}

export default async function Dashboard() {
  // await connectDB();
  const session = await getSession();

  // const board = await Board.findOne({
  //   userId: session?.user.id,
  //   // name: "Job Hunt"
  // });

  if (!session) return <div>Please log in</div>;

  const board = await getUserBoardData(session.user.id);
  console.log(board);

  return (
    <>
      <KanbanBoard boardData={board} />
    </>
  );
}
