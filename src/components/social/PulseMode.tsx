import { FeedContainer } from "./containers";

interface PulseModeProps {
  onACEarned?: (amount: number) => void;
}

const PulseMode = ({ onACEarned }: PulseModeProps) => {
  return (
    <FeedContainer
      contentType="pulse"
      layout="vertical"
      features={{ compose: true }}
      onACEarned={onACEarned}
    />
  );
};

export default PulseMode;
