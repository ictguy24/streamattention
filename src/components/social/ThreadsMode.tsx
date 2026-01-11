import { FeedContainer } from "./containers";

interface ThreadsModeProps {
  onACEarned?: (amount: number) => void;
}

const ThreadsMode = ({ onACEarned }: ThreadsModeProps) => {
  return (
    <FeedContainer
      contentType="thread"
      layout="vertical"
      features={{ compose: true, quotes: true, audio: true, media: true }}
      onACEarned={onACEarned}
    />
  );
};

export default ThreadsMode;
