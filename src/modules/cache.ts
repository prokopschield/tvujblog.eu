import { encode, decode } from 'doge-json';
import fs from 'fs';
import { DB } from 'insta-db';
import { contentType, extension } from 'mime-types';
import nsblob from 'nsblob';
import { functions as nstore } from '@prokopschield/nstore';
import { getConfig } from 'doge-config';

const config = getConfig('cache');

const db = new DB({
	read_only_files: config.obj.read_only_files.array.map(String),
	size: (config.num.size ||= 1024 * 1024 * 1024),
	storage_copies: config.obj.storage_copies.array.map(String),
	storage_file: config.str.storage_file || 'cache.db',
});

export const cache = {
	async get(url: string) {
		try {
			const { ext, hash } = decode(db.getString(url));
			return {
				mime: contentType(ext),
				data: await nstore.cat(hash),
			};
		} catch {}
	},
	async put(url: string, mime: string, data: Buffer) {
		try {
			const hash = await nsblob.store(data);
			const ext = extension(mime);
			if (ext && hash) {
				db.set(url, encode({ ext, hash }));
			}
		} catch {}
	},
};
