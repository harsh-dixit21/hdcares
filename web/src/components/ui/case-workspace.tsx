import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { PlanTask } from '@/lib/plan-backup';
import type { ActivityEntry } from '@/lib/activity-journal';

type Workspace = {
  tasks: PlanTask[];
  setTasks: Dispatch<SetStateAction<PlanTask[]>>;
  entries: ActivityEntry[];
  setEntries: Dispatch<SetStateAction<ActivityEntry[]>>;
};

const WorkspaceContext = createContext<Workspace | null>(null);
export function useCaseWorkspace() {
  const workspace = useContext(WorkspaceContext);
  if (!workspace) throw new Error('Case workspace is unavailable.');
  return workspace;
}

export function CaseWorkspace({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  return <WorkspaceContext.Provider value={{ tasks, setTasks, entries, setEntries }}>{children}</WorkspaceContext.Provider>;
}

export function WorkspaceOverview() {
  const { tasks, entries } = useCaseWorkspace();
  return <nav className="tool-shortcuts" aria-label="Workspace overview">
    <a href="#personal-plan">Action plan · {tasks.filter(task => !task.done).length} pending</a>
    <a href="#activity-journal">Activity journal · {entries.length} entries</a>
  </nav>;
}
