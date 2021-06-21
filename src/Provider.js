import React, { Children } from 'react';
import PropTypes from 'prop-types';

import Context from './Context';
import NotificationList from './NotificationList';
import Notification from './Notification';

class Provider extends React.PureComponent {
    constructor(props) {
        super(props);

        this.showNotification = this.showNotification.bind(this);
    }

    showNotification(notificationOptions) {
        if (this.notificationList) {
            this.notificationList.show(notificationOptions);
        }
    }

    render() {
        return (
            <Context.Provider value={this.showNotification}>
                {Children.only(this.props.children)}
                <NotificationList
                    ref={(ref) => {
                        this.notificationList = ref;
                    }}
                    {...this.props}
                />
            </Context.Provider>
        );
    }
}

Provider.propTypes = {
    ...NotificationList.propTypes,
    children: PropTypes.element.isRequired,
};

export default Provider;
