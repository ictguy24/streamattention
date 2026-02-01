import { FeedContainer } from "./containers";

interface ThreadsModeProps {
  onACEarned?: (amount: number) => void;
}

const ThreadsMode = ({ onACEarned }: ThreadsModeProps) => {
  return (
    <FeedContainer
      contentType="thread"
      destination="threads"
      layout="vertical"
      features={{ compose: true, quotes: true, audio: true, media: true }}
      emptyMessage="No threads yet"
      emptySubMessage="Start a discussion or wait for others to share"
      onACEarned={onACEarned}
    />
  );
};

export default ThreadsMode;
