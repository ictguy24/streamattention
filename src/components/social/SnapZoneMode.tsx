import { StoriesContainer } from "./containers";

interface SnapZoneModeProps {
  onACEarned?: (amount: number) => void;
}

const SnapZoneMode = ({ onACEarned }: SnapZoneModeProps) => {
  return <StoriesContainer onACEarned={onACEarned} />;
};

export default SnapZoneMode;
