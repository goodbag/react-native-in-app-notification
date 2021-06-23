import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, Image, Platform, Dimensions } from 'react-native';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';
import {
    PanGestureHandler, State, PanGestureHandlerStateChangeEvent
} from 'react-native-gesture-handler';

import DefaultNotificationBody from './DefaultNotificationBody';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
    notification: {
        // position: 'absolute',
        // width: '100%',
    },
});

const MIN_TRANSLATE_Y = -1000;
const MAX_TRANSLATE_Y = 0;
const MIN_TRANSLATE_X = 0;
const MAX_TRANSLATE_X = 1000;
const SWIPE_PIXELS_TO_CLOSE = 40;
const SWIPE_ANIMATION_DURATION = 200;

class Notification extends Component {
    onPanGestureEvent;
    translatePan;
    swipeDirection = 'vertical';

    constructor() {
        super();

        this.heightOffset = isIphoneX() ? getStatusBarHeight() : 0;

        this.show = this.show.bind(this);
        // this.showNotification = this.showNotification.bind(this);
        this.closeNotification = this.closeNotification.bind(this);

        if (Platform.OS === 'android') {
            this.swipeDirection = 'horizontal';
        }

        this.translatePan = new Animated.Value(0);
        this.translatePan.addListener((event) => {
            console.log('translatePan', event);
        })
        let translatePanInterpolated;
        if (this.swipeDirection === 'vertical') {
            translatePanInterpolated = this.translatePan.interpolate({
                inputRange: [MIN_TRANSLATE_Y, MAX_TRANSLATE_Y],
                outputRange: [MIN_TRANSLATE_Y, MAX_TRANSLATE_Y],
                extrapolate: 'clamp',
            });
            // translatePanInterpolated = this.translatePan;
            this.onPanGestureEvent = Animated.event([{ nativeEvent: { translationY: this.translatePan } }], {
                useNativeDriver: true,
            });
        } else {
            translatePanInterpolated = this.translatePan.interpolate({
                inputRange: [MIN_TRANSLATE_X, MAX_TRANSLATE_X],
                outputRange: [MIN_TRANSLATE_X, MAX_TRANSLATE_X],
                extrapolate: 'clamp',
            })
            this.onPanGestureEvent = Animated.event([{ nativeEvent: { translationX: this.translatePan } }], {
                useNativeDriver: true,
            });
        }

        this.state = {
            animatedValue: new Animated.Value(0),
            translatePan: this.translatePan,
            translatePanInterpolated,
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
        console.log('[closeNotification] start onClose');
        Animated.timing(this.state.animatedValue, {
            toValue: 0,
            duration: this.props.openCloseDuration,
            useNativeDriver: true,
        }).start(() => {
            console.log('[closeNotification] onClose finished');
            if (onClose) {
                this.props.onClose();
            }
        });
    }

    show() {
        const { closeInterval, title, message, onPress, icon, vibrate, additionalProps } = this.props;
        const { isOpen } = this.state;
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

    onHandlerStateChange({ nativeEvent }) {
        if (nativeEvent.state === State.ACTIVE) {
            console.log('onHandlerStateChange nativeEvent.state === State.ACTIVE');
        }
        if (nativeEvent.oldState !== State.ACTIVE) {
            console.log('onHandlerStateChange nativeEvent.oldState !== State.ACTIVE');
            return;
        }
        console.log('onHandlerStateChange ---', nativeEvent.translationY);

        const swipePixelsToClose = SWIPE_PIXELS_TO_CLOSE;
        let isSwipedOut;
        if (this.swipeDirection === 'vertical') {
            isSwipedOut = Math.abs(nativeEvent.translationY) > swipePixelsToClose;
        }
        else {
            isSwipedOut = Math.abs(nativeEvent.translationX) > swipePixelsToClose;
        }

        if (isSwipedOut) {
            this.closeNotification();
        }
        else {
            Animated.timing(this.translatePan, {
                toValue: this.swipeDirection === 'vertical' ? MAX_TRANSLATE_Y : 0,
                easing: this.showParams?.swipeEasing,
                duration: SWIPE_ANIMATION_DURATION,
                useNativeDriver: true,
            }).start();
        }
    }

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
        let animatedPixels, animated, transform;
        if (this.swipeDirection === 'vertical') {
            animatedPixels = animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-height, 0],
            });
            animated = Animated.add(animatedPixels, this.state.translatePanInterpolated);
            transform = [
                {
                    translateY: animated,
                },
            ];
        } else {
            animatedPixels = animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [viewportWidth, 0],
            });
            animated = Animated.add(animatedPixels, this.state.translatePanInterpolated);
            transform = [
                {
                    translateX: animated,
                },
            ];
        }

        return (
            <PanGestureHandler onGestureEvent={this.onPanGestureEvent} onHandlerStateChange={this.onHandlerStateChange.bind(this)}>
                <Animated.View
                    style={[
                        styles.notification,
                        { height, backgroundColor: backgroundColour },
                        {
                            transform: transform
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
            </PanGestureHandler>
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
