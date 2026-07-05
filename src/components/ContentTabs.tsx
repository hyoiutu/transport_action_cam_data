import { Box, Button, Flex } from '@chakra-ui/react';
import type { LucideProps } from 'lucide-react';
import { Archive, Files } from 'lucide-react';
import type { ComponentType } from 'react';

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
    fontSize="13px"
    fontWeight={600}
    color={isActive ? '#fff' : 'textMuted'}
    bg={isActive ? 'rgba(138, 43, 226, 0.15)' : 'transparent'}
    border={isActive ? '1px solid' : 'none'}
    borderColor={isActive ? 'borderActive' : undefined}
    onClick={onClick}
  >
    <Icon size={14} /> {label} (
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
    height="64px"
    borderBottom="1px solid"
    borderColor="borderDefault"
    padding="0 24px"
    alignItems="center"
    justifyContent="space-between"
    bg="rgba(15, 15, 21, 0.8)"
    backdropFilter="blur(10px)"
  >
    <Flex gap="8px">
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
    <Box fontSize="12px" color="textMuted">
      <Box as="span" id="scan-info">
        {scanInfo}
      </Box>
    </Box>
  </Flex>
);
