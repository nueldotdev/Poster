

interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  delay?: number;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'scale';
  visible?: boolean = true;
  visibleDuration?: number;

  type?: 'filled' | 'outline' | 'muted';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
}


interface TextInputProps extends ComponentProps {
  placeholder?: string;
  value: string = "";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}