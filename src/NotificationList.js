import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, Image, FlatList, View } from 'react-native';
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper';

import Notification from './Notification';

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'transparent',
  },
});

class NotificationList extends Component {
  constructor() {
    super();
    
    this.heightOffset = isIphoneX() ? getStatusBarHeight() : 0;
    
    this.show = this.show.bind(this);
    this.notificationListRefs = [];
    // this.showNotification = this.showNotification.bind(this);
    // this.closeNotification = this.closeNotification.bind(this);
    
    this.state = {
      notifications: [],
    };
  }
  
  show(
    { title, message, onPress, icon, vibrate, additionalProps } = {
      title: '',
      message: '',
      onPress: null,
      icon: null,
      vibrate: true,
      additionalProps: {},
    },
    ) {
      const { closeInterval } = this.props;
      const { isOpen } = this.state;
      const id = (Math.floor(Date.now() + (Math.random() * 10000)) + '');

      console.log('notificationList.show', this.props);
      
      // Clear any currently showing notification timeouts so the new one doesn't get prematurely
      // closed
    //   clearTimeout(this.currentNotificationInterval);
      
      const notification = {
        isOpen: true,
        title,
        message,
        onPress,
        icon,
        vibrate,
        additionalProps,
        id,
        // notificationBodyComponent,
      };
      this.setState(
        {
          notifications: [
            ...this.state.notifications,
            notification
          ]
        }
        );
      }
      
      //   showNotification(done) {
      //     Animated.timing(this.state.animatedValue, {
      //       toValue: 1,
      //       duration: this.props.openCloseDuration,
      //       useNativeDriver: true,
      //     }).start(done);
      //   }
      
      //   closeNotification(done) {
      //     Animated.timing(this.state.animatedValue, {
      //       toValue: 0,
      //       duration: this.props.openCloseDuration,
      //       useNativeDriver: true,
      //     }).start(done);
      //   }
      
      render() {
        const {
          height,
          topOffset,
          backgroundColour,
          iconApp,
          notificationBodyComponent,
        } = this.props;
        
        const { animatedValue, title, message, onPress, isOpen, icon, vibrate } = this.state;
        
        console.log('render notificationList', this.state.notifications);
        return (
          <FlatList
          style={styles.notificationContainer}
                contentContainerStyle={{ paddingTop: topOffset }}
          data={this.state.notifications}
            // getItemLayout={(data, index) => (
            //     { length: height, offset: height * index, index }
            // )}
          renderItem={({item}) => 
            (<Notification
                {...this.props}
                {...item}
                key={item.id}
                notificationBodyComponent={notificationBodyComponent}
                onClose={() => {
                    const new_notifications = this.state.notifications.filter(it => it !== item);
                    this.setState({
                        notifications: new_notifications,
                    }, () => {
                        console.log('this.close', this.state.notifications.indexOf(item), item, this.state.notifications, new_notifications);
                    });
                }}
                ref={itemRef => {
                    if(itemRef) {
                        this.notificationListRefs[item.id] = itemRef;
                        // console.log('itemRef', itemRef, item);
                        itemRef.show();
                    }
            }}></Notification>)
          }>
          
          </FlatList>
          );
        }
      }
      
      NotificationList.propTypes = {
        ...Notification.propTypes,
      };
      
      export default NotificationList;
      