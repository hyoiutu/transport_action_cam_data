import { Box, Button, Flex } from '@chakra-ui/react';
import type { LucideProps } from 'lucide-react';
import { Archive, Files } from 'lucide-react';
import type { ComponentType } from 'react';
import { iconSizes } from '../theme';

type TabButtonProps = {
  id: string;
  isActive: boolean;
  icon: ComponentType<LucideProps>;
  label: string;
  count: number;
  countId: string;
  onClick: () => void;
};

// tab-src / tab-dest で繰り返されるstyle propsをまとめるための、このファイル内でのみ使う専用コンポーネント
const TabButton = ({ id, isActive, icon: Icon, label, count, countId, onClick }: TabButtonProps) => (
  <Button
    id={id}
    variant="ghost"
    fontSize="xs"
    fontWeight="semibold"
    color={isActive ? 'textInverse' : 'textMuted'}
    bg={isActive ? 'brandPrimaryMuted' : 'transparent'}
    border={isActive ? 'sm' : 'none'}
    borderColor={isActive ? 'borderActive' : undefined}
    onClick={onClick}
  >
    <Icon size={iconSizes.md} /> {label} (
    <Box as="span" id={countId}>
      {count}
    </Box>
    )
  </Button>
);

type ContentTabsProps = {
  currentTab: 'src' | 'dest';
  srcCount: number;
  destCount: number;
  scanInfo: string;
  onTabChange: (tab: 'src' | 'dest') => void;
};

export const ContentTabs = ({ currentTab, srcCount, destCount, scanInfo, onTabChange }: ContentTabsProps) => (
  <Flex
    height="16"
    borderBottom="sm"
    borderColor="borderDefault"
    paddingX="6"
    alignItems="center"
    justifyContent="space-between"
    bg="bgChrome"
    backdropFilter="blur(10px)"
  >
    <Flex gap="2">
      <TabButton
        id="tab-src"
        isActive={currentTab === 'src'}
        icon={Files}
        label="コピー元ファイル"
        count={srcCount}
        countId="count-src"
        onClick={() => onTabChange('src')}
      />
      <TabButton
        id="tab-dest"
        isActive={currentTab === 'dest'}
        icon={Archive}
        label="コピー先フォルダ内"
        count={destCount}
        countId="count-dest"
        onClick={() => onTabChange('dest')}
      />
    </Flex>
    <Box fontSize="xs" color="textMuted">
      <Box as="span" id="scan-info">
        {scanInfo}
      </Box>
    </Box>
  </Flex>
);
