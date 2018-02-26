'use strict';


var pool = require('./pool')
class Client {
	constructor(opts, namesapce) {
		// var poolB = pool(opts);
		this.use(namesapce);
		this.pool = pool(opts); //new SocketPool(opts);
	}

	async issueCommand(command, parseItems) {
		let sock = await this.pool.acquire();
		try {
			let res = await sock.sendCommand(command);
			if (parseItems && res && res.items) {
				res.items = res.items.map( (doc) => JSON.parse(doc) )
			}
			return res;
		} catch (e) {
			// console.error(e.stack)
			throw(e)
		} finally {
			this.pool.release(sock);
		}
		
	};

	use(namespace) {
		this.ns = namespace || null;
		return this;
	}

	getDocument(id) {
		var command = {
			action: 'getDocument',
			ns: this.ns,
			input: id
		}
		return this.issueCommand(command);
	}

	addDocuments(docs) {
		var command = {
			action: 'addDocuments',
			ns: this.ns,
			input: docs
		}
		return this.issueCommand(command);
	}

	deleteDocuments(docs) {
		var command = {
			action: 'deleteDocuments',
			ns: this.ns,
			input: docs
		}
		return this.issueCommand(command);
	}

	namespaceConfig() {
		var command = {
			action: 'namespaceConfig',
			ns: this.ns,
			input: ''
		}
		return this.issueCommand(command);
	}

	createNamespace(nsConfig) {
		var command = {
			action: 'createNamespace',
			input: nsConfig
		}
		return this.issueCommand(command);
	}

	search(query) {
		var command = {
			action: 'search',
			ns: this.ns,
			input: query
		}
		
		return this.issueCommand(command, true);
		
	}

	async quit() {
		try {
			await this.pool.drain();
			var a = await this.pool.clear();	
			console.log("Connection pool closed");
			return a;
		} catch(e) {
			console.log(e.stack);
		}
		
	}
}

module.exports = Client;
