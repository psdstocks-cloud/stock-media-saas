// Global type declarations to fix module resolution issues

declare module 'react-server-dom-webpack/server.edge' {
  export function renderToReadableStream(
    element: any,
    options?: any
  ): Promise<ReadableStream>;
  export function decodeReply(body: string, formFieldPrefix?: string): Promise<any>;
  export function decodeAction(formData: FormData): Promise<any>;
  export function decodeFormState(
    actionId: string,
    formData: FormData,
    prevState: any
  ): Promise<any>;
}

declare module 'VAR_MODULE_GLOBAL_ERROR' {
  const GlobalError: React.ComponentType<any>;
  export default GlobalError;
}

// Fix for webpack types
declare module 'next/dist/compiled/webpack/webpack' {
  export * from 'webpack';
  export { default } from 'webpack';
  export namespace webpack {
    interface RuleSetUseItem {
      loader?: string;
      options?: any;
    }
    class DefinePlugin {
      constructor(definitions: Record<string, any>);
    }
  }
}

// Fix for fs module
declare module 'fs' {
  import * as fs from 'fs';
  export = fs;
}

// Fix for AWS SDK
declare module '@aws-sdk/client-sesv2' {
  export * from '@aws-sdk/client-sesv2/dist-types/index';
  export { default } from '@aws-sdk/client-sesv2/dist-types/index';
}

// Fix React import issues by providing proper module declarations
declare module '@types/react' {
  export * from 'react';
  export { default } from 'react';
}
