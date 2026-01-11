import { FeedContainer } from "./containers";

interface FuzzModeProps {
  onACEarned?: (amount: number) => void;
}

const FuzzMode = ({ onACEarned }: FuzzModeProps) => {
  return (
    <FeedContainer
      contentType="fuzz"
      layout="grid"
      columns={3}
      onACEarned={onACEarned}
    />
  );
};

export default FuzzMode;
