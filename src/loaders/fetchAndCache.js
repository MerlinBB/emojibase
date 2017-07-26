/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import 'isomorphic-fetch';
import fs from 'fs';
import path from 'path';
import log from '../helpers/log';
import readCache from '../helpers/readCache';
import writeCache from '../helpers/writeCache';

export default async function fetchAndCache<T>(
  url: string,
  name: string,
  parser: (text: string) => T,
): T {
  // Check the cache first
  const cache = readCache(name);

  if (cache) {
    return cache;
  }

  log.info('load', `Fetching ${name} data from ${url}`);

  // Parse the response
  let text = '';

  try {
    text = await fetch(url).then((response) => {
      if (response.ok) {
        return response.text();
      }

      throw new Error(`${response.status} ${response.statusText}`);
    });
  } catch (error) {
    log.error('load', `Failed to fetch ${url}: ${error.message}`);

    return {};
  }

  // Cache the data
  const data = parser(text);

  writeCache(name, data);

  log.success('load', `Fetched and cached ${name}`);

  return data;
}