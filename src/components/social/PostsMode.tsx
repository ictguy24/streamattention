import { FeedContainer } from "./containers";

interface PostsModeProps {
  onACEarned?: (amount: number) => void;
}

const PostsMode = ({ onACEarned }: PostsModeProps) => {
  return (
    <FeedContainer
      contentType="post"
      layout="masonry"
      features={{ compose: true, media: true }}
      onACEarned={onACEarned}
    />
  );
};

export default PostsMode;
