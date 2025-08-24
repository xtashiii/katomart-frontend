import { NextResponse } from 'next/server';

interface Course {
  id: string;
  name: string;
  modules: Module[];
}
interface Module {
  id: string;
  name: string;
  lessons: Lesson[];
}
interface Lesson {
  id: string;
  name: string;
}

let downloadState = {
  running: false,
  paused: false,
  progress: {} as Record<string, number>,
  finished: false,
};

let simulationTimeout: NodeJS.Timeout | null = null;

function stopSimulation() {
  if (simulationTimeout) {
    clearTimeout(simulationTimeout);
    simulationTimeout = null;
  }
}

function resetState() {
  stopSimulation();
  downloadState = {
    running: false,
    paused: false,
    progress: {},
    finished: false,
  };
}

function startSimulation(
  selectedItems: Record<string, boolean>,
  courses: Course[]
) {
  stopSimulation();

  const lessonIdsToDownload: string[] = [];
  courses.forEach((course: Course) => {
    course.modules.forEach((mod: Module) => {
      mod.lessons.forEach((les: Lesson) => {
        if (selectedItems[les.id]) {
          lessonIdsToDownload.push(les.id);
        }
      });
    });
  });

  if (lessonIdsToDownload.length === 0) {
    resetState();
    return;
  }

  downloadState = {
    running: true,
    paused: false,
    progress: {},
    finished: false,
  };

  let idx = 0;
  function step() {
    if (downloadState.paused) {
      simulationTimeout = setTimeout(step, 600);
      return;
    }

    if (idx >= lessonIdsToDownload.length) {
      downloadState.running = false;
      downloadState.finished = true;
      stopSimulation();
      return;
    }

    const id = lessonIdsToDownload[idx];
    downloadState.progress = { ...downloadState.progress, [id]: 100 };

    idx++;
    simulationTimeout = setTimeout(step, 600);
  }
  simulationTimeout = setTimeout(step, 600);
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }
  return NextResponse.json(downloadState);
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }
  const { selectedItems, courses } = await request.json();
  if (!selectedItems || !courses) {
    return new Response('Missing selectedItems or courses', { status: 400 });
  }
  startSimulation(selectedItems, courses);
  return NextResponse.json({ message: 'Download simulation started' });
}

export async function PUT() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }
  if (downloadState.running) {
    downloadState.paused = !downloadState.paused;
  }
  return NextResponse.json(downloadState);
}

export async function DELETE() {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 });
  }
  resetState();
  return NextResponse.json({ message: 'Download stopped' });
}
