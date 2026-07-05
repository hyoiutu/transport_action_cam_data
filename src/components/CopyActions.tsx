import { Button, Flex } from '@chakra-ui/react';
import { Play, Square } from 'lucide-react';
import { gradients } from '../theme';

type CopyActionsProps = {
  canStartCopy: boolean;
  isCopying: boolean;
  onStart: () => void;
  onCancel: () => void;
};

export const CopyActions = ({ canStartCopy, isCopying, onStart, onCancel }: CopyActionsProps) => (
  <Flex direction="column" gap="10px" marginTop="auto">
    <Button
      id="btn-start-copy"
      disabled={!canStartCopy}
      onClick={onStart}
      bg={gradients.primary}
      color="#fff"
      boxShadow="0 4px 15px rgba(138, 43, 226, 0.3)"
      _hover={{ transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(138, 43, 226, 0.5)' }}
      _disabled={{ bg: '#252535', color: 'textMuted', boxShadow: 'none', cursor: 'not-allowed' }}
    >
      <Play size={16} /> コピーを開始する
    </Button>
    <Button
      id="btn-cancel-copy"
      disabled={!isCopying}
      onClick={onCancel}
      bg={gradients.danger}
      color="#fff"
      boxShadow="0 4px 15px rgba(255, 75, 92, 0.3)"
      _hover={{ transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(255, 75, 92, 0.5)' }}
      _disabled={{ bg: '#252535', color: 'textMuted', boxShadow: 'none', cursor: 'not-allowed', opacity: 0.5 }}
    >
      <Square size={16} /> キャンセル
    </Button>
  </Flex>
);
