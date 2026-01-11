import { FeedContainer } from "./containers";

interface MomentsModeProps {
  onACEarned?: (amount: number) => void;
}

const MomentsMode = ({ onACEarned }: MomentsModeProps) => {
  return (
    <FeedContainer
      contentType="moment"
      layout="vertical"
      features={{ compose: false }}
      onACEarned={onACEarned}
    />
  );
};

export default MomentsMode;
