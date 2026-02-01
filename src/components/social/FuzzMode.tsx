import { FeedContainer } from "./containers";

interface FuzzModeProps {
  onACEarned?: (amount: number) => void;
}

const FuzzMode = ({ onACEarned }: FuzzModeProps) => {
  return (
    <FeedContainer
      contentType="fuzz"
      destination="fuzz"
      layout="grid"
      columns={3}
      emptyMessage="No visual moments yet"
      emptySubMessage="Share your creative moments here"
      onACEarned={onACEarned}
    />
  );
};

export default FuzzMode;
