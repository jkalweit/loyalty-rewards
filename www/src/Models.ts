/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./SyncNode.ts" />

"use strict"

namespace Models {

	export interface Db extends SyncNode.ISyncNode {
		loyaltyMembers: {[key: string]: LoyaltyMember};
		employees: {[key: string]: Employee};
		//weeks: {[key: string]: Week};
		shifts: {[key: string]: Shift};
		tickets: {[key: string]: Ticket};
	}
	export interface LoyaltyMember extends SyncNode.ISyncNode {
		key: string;
		name: string;
		phone: string;
		note: string;
		points: {[key: string]: LoyaltyMemberPoints};
	}
	export interface LoyaltyMemberPoints {
		key: string;
		type: string;
		amount: number;
	}
	export interface Employee extends SyncNode.ISyncNode {
		key: string;
		name: string;
		phone: string;
		wage: number;
		note: string;
	}
	
	export interface Ticket extends SyncNode.ISyncNode {
		key: string;
		items: {[key: string]: TicketItem}
	}
	export interface TicketItem extends SyncNode.ISyncNode {
		key: string;
		name: string;
		price: number;
		modifiers: {[key: string]: TicketItemModifier}
	}
	export interface TicketItemModifier extends SyncNode.ISyncNode {
		key: string;
		name: string;
	}
	
	
	export interface Week extends SyncNode.ISyncNode {
		key: string;
		shifts: {[key: string]: Shift};
	}
	export interface Shift extends SyncNode.ISyncNode {
		key: string;
		name: string;
		day: string;
		start: string;
		end: string;
		note: string;
	}

}
