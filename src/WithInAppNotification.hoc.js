import React from 'react';

import hoistNonReactStatic from 'hoist-non-react-statics';

import Context from './Context';

function withInAppNotification(WrappedComponent) {
  class Enhanced extends React.PureComponent {
    render() {
      return (
        <Context.Consumer>
          {showNotification => (
            React.forwardRef((props, ref) => (<WrappedComponent
              {...this.props}
              ref={ref}
              showNotification={showNotification}
            />))
          )}
        </Context.Consumer>
      );
    }
  }

  // Pass over static props
  hoistNonReactStatic(Enhanced, WrappedComponent);

  return Enhanced;
}

export default withInAppNotification;
