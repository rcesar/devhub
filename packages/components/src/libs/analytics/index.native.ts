import _ from 'lodash'
import * as firebase from 'react-native-firebase'
import {
  GoogleAnalyticsSettings,
  GoogleAnalyticsTracker,
} from 'react-native-google-analytics-bridge'

import { appVersion } from '../../components/common/AppVersion'
import { Analytics } from './'

GoogleAnalyticsSettings.setDryRun(__DEV__)
GoogleAnalyticsSettings.setDispatchInterval(5)
firebase.analytics().setAnalyticsCollectionEnabled(__DEV__)

const tracker = new GoogleAnalyticsTracker('UA-52350759-2')

tracker.customDimensionsFieldsIndexMap = {
  user_id: 1,
}

const log = (...args: any[]) => {
  console.log('[ANALYTICS]', ...args) // tslint:disable-line no-console
}

export const analytics: Analytics = {
  setUser(userId) {
    if (__DEV__) log('set', { user_id: userId })
    tracker.setUser(userId)
    firebase.analytics().setUserId(userId)
  },

  trackEvent(category, action, label, value, payload = {}) {
    if (__DEV__) log('event', category, action)
    tracker.trackEvent(
      category,
      action,
      { label, value },
      {
        // TODO: Test this and fix
        customDimensions: _.isPlainObject(payload)
          ? payload
          : typeof payload === 'string' || typeof payload === 'number'
          ? ({ payload } as any)
          : undefined,
      },
    )
    firebase.analytics().logEvent(action.replace(/\//g, '_'), {
      event_category: category,
      event_label: label,
      value,
      ...payload,
    })
  },

  trackModalView(modalName) {
    this.trackScreenView(`${modalName}_MODAL`)
  },

  trackScreenView(screenName) {
    if (__DEV__) log('screen_view', screenName)
    tracker.trackScreenView(screenName)
    firebase.analytics().setCurrentScreen(screenName)
  },
}
