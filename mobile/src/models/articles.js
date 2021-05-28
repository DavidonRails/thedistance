import moment from 'moment';
import Api from '../lib/api';
import HandleErrorMessage from '../lib/format-error-messages';
import initialState from '../store/articles';
import Config from '../constants/config';
import { getFeaturedImageUrl } from '../lib/images';
import { ucfirst, stripHtml } from '../lib/string';
import { errorMessages, successMessages } from '../constants/messages';
import pagination from '../lib/pagination';

/**
 * Transform the endpoint data structure into our redux store format
 * @param {obj} item
 */
const transform = (item) => ({
  index: item.index,
  id: Math.floor(Math.random() * 10000),
  name: item.name && item.name.html ? ucfirst(stripHtml(item.name.html)) : '',
  content: item.description && item.description.html ? stripHtml(item.description.html) : '',
  contentRaw: item.description && item.description.text,
  excerpt: item.excerpt && item.excerpt.rendered ? stripHtml(item.excerpt.rendered) : '',
  date: moment(item.start.utc).format(Config.dateFormat) || '',
  logo: item.logo ? item.logo : null,
  slug: item.slug || null,
  link: item.url || null,
  image: getFeaturedImageUrl(item),
});

export default {
  namespace: 'articles',

  /**
   *  Initial state
   */
  state: initialState,

  /**
   * Effects/Actions
   */
  effects: (dispatch) => ({
    /**
     * Get a list from the API
     * @param {obj} rootState
     * @returns {Promise}
     */
    async fetchList({ forceSync = false, page = 1 } = {}, rootState) {
      const { articles = {} } = rootState;
      const { lastSync = {}, meta = {} } = articles;
      const { lastPage } = meta;

      // Only sync when it's been 5mins since last sync
      if (lastSync[page]) {
        if (!forceSync && moment().isBefore(moment(lastSync[page]).add(5, 'minutes'))) {
          return true;
        }
      }

      // We've reached the end of the list
      if (page && lastPage && page > lastPage) {
        throw HandleErrorMessage({ message: `Page ${page} does not exist` });
      }

      try {
        const response = await Api.get();

        const { data, headers } = response;
        var events = data.events;
        return !events || events.length < 1
          ? true
          : dispatch.articles.replace({ events, headers, page });
      } catch (error) {
        throw HandleErrorMessage(error);
      }
    },

    /**
     * Get a single item from the API
     * @param {number} id
     * @returns {Promise[obj]}
     */
    async fetchSingle(index) {
      try {
        const response = await Api.get();
        const { data } = response;

        if (!data) {
          throw new Error({ message: errorMessages.articles404 });
        }
        var events = data.events;

        return transform(events[index]);
      } catch (error) {
        throw HandleErrorMessage(error);
      }
    },

    /**
     * Save date to redux store
     * @param {obj} data
     * @returns {Promise[obj]}
     */
    async save(data) {
      try {
        if (Object.keys(data).length < 1) {
          throw new Error({ message: errorMessages.missingData });
        }

        dispatch.articles.replaceUserInput(data);
        return successMessages.defaultForm; // Message for the UI
      } catch (error) {
        throw HandleErrorMessage(error);
      }
    },
  }),

  /**
   * Reducers
   */
  reducers: {
    /**
     * Replace list in store
     * @param {obj} state
     * @param {obj} payload
     */
    replace(state, payload) {
      let newList = null;
      const { events, headers, page } = payload;

      // Loop data array, saving items in a usable format
      if (events && typeof events === 'object') {
        newList = events.map((item, index) =>{
          var e = item;
          e.index = index;
          return transform(e);
        });
      }

      // Create our paginated and flat lists
      const listPaginated = page === 1 ? { [page]: newList } : { ...state.listPaginated, [page]: newList };
      const listFlat = Object.keys(listPaginated).map((k) => listPaginated[k]).flat() || [];

      return newList
        ? {
          ...state,
          listPaginated,
          listFlat,
          lastSync: page === 1
            ? { [page]: moment().format() }
            : { ...state.lastSync, [page]: moment().format() },
          meta: {
            page,
            lastPage: parseInt(headers['x-wp-totalpages'], 10) || null,
            total: parseInt(headers['x-wp-total'], 10) || null,
          },
          pagination: pagination(headers['x-wp-totalpages'], '/articles/'),
        }
        : initialState;
    },

    /**
     * Save form data
     * @param {obj} state
     * @param {obj} payload
     */
    replaceUserInput(state, payload) {
      return {
        ...state,
        userInput: payload,
      };
    },
  },
};
