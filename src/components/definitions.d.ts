

interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  delay?: number;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'scale';
  visible?: boolean = true;
  visibleDuration?: number;
}