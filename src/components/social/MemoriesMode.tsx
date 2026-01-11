import { StoriesContainer } from "./containers";

interface MemoriesModeProps {
  onACEarned?: (amount: number) => void;
}

const MemoriesMode = ({ onACEarned }: MemoriesModeProps) => {
  return <StoriesContainer onACEarned={onACEarned} />;
};

export default MemoriesMode;
