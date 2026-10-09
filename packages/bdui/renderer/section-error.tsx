import { useEffect, Component, type ErrorInfo, type ReactNode } from 'react';
import { UnknownSection } from './unknown-section';

interface BoundaryProps {
  sectionId: string;
  sectionType: string;
  sectionVersion: number;
  children: ReactNode;
}

interface BoundaryState {
  error: Error | null;
}

export class SectionErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[SectionSlot] render error', error, info);
  }

  render() {
    const { sectionId, sectionType, children } = this.props;
    if (this.state.error) {
      return <SectionErrorView sectionId={sectionId} sectionType={sectionType} error={this.state.error} />;
    }
    return children;
  }
}

function SectionErrorView({ sectionId, sectionType, error }: { sectionId: string; sectionType: string; error: Error }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <UnknownSection sectionId={sectionId} sectionType={sectionType} reason="error" message={error.message} />;
}
