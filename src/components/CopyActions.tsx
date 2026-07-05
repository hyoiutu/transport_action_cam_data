import { Button, Flex } from '@chakra-ui/react';
import { Play, Square } from 'lucide-react';
import { gradients, iconSizes } from '../theme';

type CopyActionsProps = {
  canStartCopy: boolean;
  isCopying: boolean;
  onStart: () => void;
  onCancel: () => void;
};

export const CopyActions = ({ canStartCopy, isCopying, onStart, onCancel }: CopyActionsProps) => (
  <Flex direction="column" gap="2.5" marginTop="auto">
    <Button
      id="btn-start-copy"
      disabled={!canStartCopy}
      onClick={onStart}
      bg={gradients.primary}
      color="textInverse"
      boxShadow="brandGlow"
      _hover={{ transform: 'translateY(-1px)', boxShadow: 'brandGlowStrong' }}
      _disabled={{ bg: 'bgSurfaceDisabled', color: 'textMuted', boxShadow: 'none', cursor: 'not-allowed' }}
    >
      <Play size={iconSizes.md} /> コピーを開始する
    </Button>
    <Button
      id="btn-cancel-copy"
      disabled={!isCopying}
      onClick={onCancel}
      bg={gradients.danger}
      color="textInverse"
      boxShadow="dangerGlow"
      _hover={{ transform: 'translateY(-1px)', boxShadow: 'dangerGlowStrong' }}
      _disabled={{
        bg: 'bgSurfaceDisabled',
        color: 'textMuted',
        boxShadow: 'none',
        cursor: 'not-allowed',
        opacity: 0.5
      }}
    >
      <Square size={iconSizes.md} /> キャンセル
    </Button>
  </Flex>
);
