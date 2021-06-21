import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, Image } from 'react-native';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';

import DefaultNotificationBody from './DefaultNotificationBody';

const styles = StyleSheet.create({
    notification: {
        // position: 'absolute',
        // width: '100%',
    },
});

class Notification extends Component {
    constructor() {
        super();

        this.heightOffset = isIphoneX() ? getStatusBarHeight() : 0;

        this.show = this.show.bind(this);
        // this.showNotification = this.showNotification.bind(this);
        this.closeNotification = this.closeNotification.bind(this);

        this.state = {
            animatedValue: new Animated.Value(0),
            isOpen: false,
        };
    }

    componentDidMount() {
        Animated.timing(this.state.animatedValue, {
            toValue: 1,
            duration: this.props.openCloseDuration,
            useNativeDriver: true,
        }).start();
    }

    closeNotification() {
        const { onClose } = this.props;
        if (onClose) {
            Animated.timing(this.state.animatedValue, {
                toValue: 0,
                duration: this.props.openCloseDuration,
                useNativeDriver: true,
            }).start(() => {
                if (onClose) {
                    this.props.onClose();
                }
            });
        }
    };

    show() {
        const { closeInterval, title, message, onPress, icon, vibrate, additionalProps } = this.props;
        const { isOpen } = this.state;
        // Clear any currently showing notification timeouts so the new one doesn't get prematurely
        // closed
        // clearTimeout(this.currentNotificationInterval);
        this.setState(
            {
                isOpen: true,
                title,
                message,
                onPress,
                icon,
                vibrate,
                additionalProps,
            },
            () => {
                this.currentNotificationInterval = setTimeout(() => {
                    this.setState(
                        {
                            isOpen: false,
                            title: '',
                            message: '',
                            onPress: null,
                            icon: null,
                            vibrate: true,
                            additionalProps,
                        },
                        this.closeNotification,
                    );
                }, closeInterval);
            })
    }

    // showNotification(done) {
    //     // Animated.timing(this.state.animatedValue, {
    //     //   toValue: 1,
    //     //   duration: this.props.openCloseDuration,
    //     //   useNativeDriver: true,
    //     // }).start(done);
    // }

    //   closeNotification(done) {
    //     // Animated.timing(this.state.animatedValue, {
    //     //   toValue: 0,
    //     //   duration: this.props.openCloseDuration,
    //     //   useNativeDriver: true,
    //     // }).start(done);
    //   }

    render() {
        const {
            height,
            topOffset,
            backgroundColour,
            iconApp,
            notificationBodyComponent: NotificationBody,
            title,
            message,
            onPress,
            isOpen,
            icon,
            vibrate,
            index
        } = this.props;

        const { animatedValue } = this.state;

        return (
            <Animated.View
                style={[
                    styles.notification,
                    { height, backgroundColor: backgroundColour },
                    {
                        transform: [
                            {
                                translateY: animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-height, 0],
                                }),
                            },
                        ],
                    },
                    {
                        opacity: animatedValue
                    }
                ]}
            >
                <NotificationBody
                    title={title}
                    message={message}
                    onPress={onPress}
                    isOpen={isOpen}
                    iconApp={iconApp}
                    icon={icon}
                    vibrate={vibrate}
                    onClose={() => this.setState({ isOpen: false }, this.closeNotification)}
                    additionalProps={this.state.additionalProps}
                />
            </Animated.View>
        );
    }
}

Notification.propTypes = {
    closeInterval: PropTypes.number,
    openCloseDuration: PropTypes.number,
    height: PropTypes.number,
    topOffset: PropTypes.number,
    backgroundColour: PropTypes.string,
    notificationBodyComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    iconApp: Image.propTypes.source,
};

Notification.defaultProps = {
    closeInterval: 4000,
    openCloseDuration: 200,
    height: 80,
    topOffset: 0,
    backgroundColour: 'white',
    notificationBodyComponent: DefaultNotificationBody,
    iconApp: null,
};

export default Notification;
