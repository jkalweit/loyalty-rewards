/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./Utils.ts" />
/// <reference path="./SyncNode.ts" />
/// <reference path="./SyncNodeSocket.ts" />
/// <reference path="./BaseViews.tsx" />
/// <reference path="./Models.ts" />

"use strict"


namespace Views {

	interface MainState {
		db?: Models.Db;
		selected?: Models.LoyaltyMember;
		filter?: string;
		filtered?: Models.LoyaltyMember[];
	}
	export class Main extends React.Component<{}, MainState> {
		ticket: Models.Ticket = {
			key: '0',
			items: {
			'0': {
				key: '0',
				name: 'Cheeseburger',
				price: 10.75,
				modifiers: {
					'0': {
						key: '0',
						name: 'mw'
					}
				}
			},
			'1': {
				key: '1',
				name: 'Hamburger',
				price: 9.00,
				modifiers: {
					'0': {
						key: '0',
						name: 'add pickles'
					}
				}
			}
			}

		}

		constructor(props: {}) {
			super(props);

			var data: Models.Db = { loyaltyMembers: {}, employees: {}, shifts: {} };

			document.addEventListener('deviceready', () => {
				console.log('	deviceready 4');
				var sync = new SyncNodeSocket.SyncNodeSocket('data', data, 'http://localhost:1337');
				//var sync = new SyncNodeSocket.SyncNodeSocket('shifts', data, 'http://timeclocker.azurewebsites.net');
				sync.onUpdated((updated: Models.Db) => {
					console.log('updated data!', updated);
					var newState: MainState = { db: updated };
					if(this.state.selected) newState.selected = updated.loyaltyMembers[this.state.selected.key];
					this.setState(newState, () => { this.updateFiltered(); });
				});

			});
			this.state = { db: data, selected: null, filter: '', filtered: [] };
		}
		edit(item: Models.LoyaltyMember) {
			this.setState({ selected: item });
		}
		updateFilter(e: any) {
			this.setState({ filter: (e.target as HTMLInputElement).value }, () => {this.updateFiltered()});
		}
		updateFiltered() {
			var filtered = Utils.toArray(this.state.db.loyaltyMembers, "name");
			if(this.state.filter !== '') {
				filtered = filtered.filter((member: Models.LoyaltyMember) => {
					return member.name.toLowerCase().indexOf(this.state.filter.trim().toLowerCase()) !== -1;
				});
			}	
			this.setState({ filtered: filtered });
		}
		handleKeyUp(e: any) {
			if(e.keyCode === 13) {
				var newMember: Models.LoyaltyMember = {
					key: new Date().toISOString(), 
					name: this.state.filter,
					phone: '',
					note: '',
					points: {}
				};
				var result = (this.state.db.loyaltyMembers as SyncNode.ISyncNode).set(newMember.key, newMember);
				this.setState({ filter: '', selected: result.value }, () => { this.updateFiltered() });
			}	
		}
		render() {	
			var members = this.state.filtered.map(
				(member: Models.LoyaltyMember) => {
					var classes = "row";
					if(this.state.selected && this.state.selected.key === member.key) {
						classes += " selected";
					}
					return 	<div key={member.key} className={classes} onClick={() => { this.setState({selected: member}); }}>
						<div className="col-sm-12">{member.name}</div>
					</div>;
				}
			);

			return ( 
					<div>
						<TicketView ticket={this.ticket} />
						<h1>Loyalty Members</h1>
						<input value={this.state.filter} onChange={this.updateFilter.bind(this)} onKeyUp={this.handleKeyUp.bind(this)} />
						{members}
						{ this.state.selected ? 
						       <LoyaltyMemberView member={this.state.selected} /> 
							: null }	
					</div>
			       );
		}
	}


	export interface LoyaltyMemberViewProps {
		member: Models.LoyaltyMember;
	}
	export interface LoyaltyMemberViewState extends BaseViews.SyncViewState {
		mutable?: Models.LoyaltyMember;
		newPoints?: Models.LoyaltyMemberPoints;
		selected?: Models.LoyaltyMemberPoints;
	}
	export class LoyaltyMemberView extends BaseViews.SyncView<LoyaltyMemberViewProps, LoyaltyMemberViewState> {
		constructor(props: LoyaltyMemberViewProps) {
			super(props, 'member');
			this.state.newPoints = {} as any;
		}
		addPoints() {
			var points: Models.LoyaltyMemberPoints = {
				key: new Date().toISOString(),
				type: ((this.refs['type'] as any).getDOMNode() as HTMLInputElement).value,
				amount: parseFloat(((this.refs['amount'] as any).getDOMNode() as HTMLInputElement).value)
			};
			var result = (this.props.member.points as SyncNode.ISyncNode).set(points.key, points);
			this.setState({ selected: result.value });
		}
		componentWillReceiveProps(nextProps: LoyaltyMemberViewProps, nextState: LoyaltyMemberViewState) {
			      if(this.shouldComponentUpdate(nextProps, nextState)) {
				      if(this.state.selected) {
					      this.setState({ selected: nextProps.member.points[this.state.selected.key] }); 
				      }
			      }
			      super.componentWillReceiveProps(nextProps, nextState);
		      }

		render() {
		
			var pointsArray = Utils.toArray(this.props.member.points);
			var totalPoints = 0;	
			var points = pointsArray.map((point: Models.LoyaltyMemberPoints) => {
				totalPoints += point.type === 'Redeem' ? point.amount * -1 : point.amount;
				var className = 'row';
				if(this.state.selected && this.state.selected.key === point.key) className += ' selected'
				if(point.type === 'Redeem') className += ' green';
				return <div key={point.key} className={className} onClick={ () => { this.setState({ selected: point }); }}>
					<div className="col-xs-3">{point.type}</div>
					<div className="col-xs-3">{point.amount}</div>
				</div>;
			});
			var member = this.state.mutable;
			return (
				<div>	
					<h2>{member.name}</h2>
					<button onClick={() => { if(confirm('Delete member?')) this.props.member.parent.remove(member.key);  }}>x</button>
					<div className="row">
						<div className="col-xs-3">Name:</div><div className="col-xs-3"><input value={member.name} onChange={this.handleChange.bind(this, 'mutable', 'name')} onBlur={this.saveField.bind(this, 'member', 'name')}/></div>
					</div>
					<div className="row">
						<div className="col-xs-3">Since:</div><div className="col-xs-3">{Utils.formatDateFromKey(member.key)}</div>
					</div>
					<div className="row">
						<div className="col-xs-3">Points:</div><div className="col-xs-3">{Utils.formatCurrency(totalPoints)}</div>
					</div>
					<div className="row">
						<div className="col-xs-3">Phone:</div><div className="col-xs-3"><input value={member.phone} onChange={this.handleChange.bind(this, 'mutable', 'phone')} onBlur={this.saveField.bind(this, 'member', 'phone')}/></div>
					</div>
					<div className="row">
						<div className="col-xs-3">Note:</div><div className="col-xs-3"><input value={member.note} onChange={this.handleChange.bind(this, 'mutable', 'note')} onBlur={this.saveField.bind(this, 'member', 'note')}/></div>
					</div>

					<div className="row">
						<select className="col-xs-3" ref="type">
							<option>Dinner</option>
							<option>Redeem</option>
						</select>
						<input className="col-xs-2" ref="amount" />
						<button className="col-xs-2" onClick={this.addPoints.bind(this)}>Add</button>	
					</div>
					{points}
					{ this.state.selected ? 
						<LoyaltyMemberPointsView immutable={this.state.selected} />
							: null }
				</div>		
			);
		}
	}



	export interface LoyaltyMemberPointsViewProps {
		immutable: Models.LoyaltyMemberPoints;
	}
	export interface LoyaltyMemberPointsViewState extends BaseViews.SyncViewState {
		mutable?: Models.LoyaltyMember;
	}
	export class LoyaltyMemberPointsView extends BaseViews.SyncView<LoyaltyMemberPointsViewProps, LoyaltyMemberPointsViewState> {
		constructor(props: LoyaltyMemberPointsViewProps) {
			super(props, 'immutable');
		}
		render() {
			var points = this.props.immutable;
			return (
				<div>	
					<button onClick={() => { if(confirm('Delete pionts?')) (points as SyncNode.ISyncNode).parent.remove(points.key);  }}>x</button>
					<div className="row">
						<div className="col-xs-3">Type:</div>
						<div className="col-xs-3"><BaseViews.SmartInput immutable={points as any} prop="type"/></div>
					</div>
					<div className="row">
						<div className="col-xs-3">Date:</div><div className="col-xs-3">{Utils.formatDateFromKey(points.key)}</div>
					</div>
					<div className="row">
						<div className="col-xs-3">Amount:</div>
						<div className="col-xs-3"><BaseViews.SmartInput immutable={points as any} prop="amount" isNumber /></div>
					</div>
				</div>
			);
		}
	}


	export interface TicketViewProps {
		ticket: Models.Ticket;
	}
	export interface TicketViewState extends BaseViews.SyncViewState {
		mutable?: Models.Ticket;
	}
	export class TicketView extends BaseViews.SyncView<TicketViewProps, TicketViewState> {
		constructor(props: TicketViewProps) {
			super(props, 'ticket');
		}
		render() {
			var items = Utils.toArray(this.props.ticket.items).map((item: Models.TicketItem) => {
				return <TicketItemView item={item} />
			});
			return <div>
					<h2>Ticket</h2>
					{items}	
					<NewTicketItemView autocompleted={(name: string) => { alert('name: ' + name);  }} />
				</div>;
		}
	}





	export interface NewTicketItemViewProps {
		autocompleted: (name: string) => void;
	}
	export interface NewTicketItemViewState extends BaseViews.SyncViewState {
		text?: string;
		editMode?: boolean;
		autocompleteFiltered?: string[];
	}
	export class NewTicketItemView extends BaseViews.SyncView<NewTicketItemViewProps, TicketItemViewState> {
		source: string[] = [
				'Cheeseburger',
				'Hamburger',
				'French Fries',
				'Cole Slaw'
			]
		constructor(props: NewTicketItemViewProps) {
			super(props, null);
			this.state.autocompleteFiltered = [];
			this.state.text = '';
			this.state.editMode = false;
		}
		handleChangeAutocomplete(e: Event) {
			var text = (e.target as HTMLInputElement).value;
			var filtered = this.filter(text);
			this.setState({ text: text, autocompleteFiltered: filtered });
		}
		autocomplete(e: any) {
			var filtered = this.state.autocompleteFiltered;
			if(filtered.length > 0) {
				var text = filtered[0];
				this.setState({ text: text });
				this.props.autocompleted(text);
			}
			this.setState({ editMode: false });
		}
		filter(partial: string): string[] {
			var filtered = this.source.filter((option: string) => {
				return option.toLowerCase().indexOf(partial.toLowerCase()) !== -1;
			});
			return filtered;
		}
		render() {
			var options = this.state.autocompleteFiltered.map((option: string) => {
				return <li key={option}>{option}</li>;
			});
			return (
					<div className="row">
						
						<input className="col-xs-12" value={this.state.text} 
							onChange={ this.handleChangeAutocomplete.bind(this) }
							onFocus={ () => { this.setState({ editMode: true }); } } 
							onBlur={ this.autocomplete.bind(this) } />	
						
						{ this.state.editMode ?
						<ul className="col-xs-12">
							{options}
						</ul>
						: null }
					
					</div>
					);
		}
	}









	export interface TicketItemViewProps {
		item: Models.TicketItem;
	}
	export interface TicketItemViewState extends BaseViews.SyncViewState {
		mutable?: Models.TicketItem;
		text?: string;
		editMode?: boolean;
		autocompleteFiltered?: string[];
	}
	export class TicketItemView extends BaseViews.SyncView<TicketItemViewProps, TicketItemViewState> {
		source: string[] = [
				'Cheeseburger',
				'Hamburger',
				'French Fries',
				'Cole Slaw'
			]
		constructor(props: TicketItemViewProps) {
			super(props, 'item');
			this.state.autocompleteFiltered = [];
			this.state.text = this.props.item.name;
			this.state.editMode = false;
		}
		handleChangeAutocomplete(e: Event) {
			var text = (e.target as HTMLInputElement).value;
			var filtered = this.filter(text);
			this.setState({ text: text, autocompleteFiltered: filtered });
		}
		autocomplete(e: any) {
			var filtered = this.state.autocompleteFiltered;
			if(filtered.length > 0) {
				this.setState({ text: filtered[0] });
			}
			this.setState({ editMode: false });
		}
		filter(partial: string): string[] {
			var filtered = this.source.filter((option: string) => {
				return option.toLowerCase().indexOf(partial.toLowerCase()) !== -1;
			});
			return filtered;
		}
		render() {
			var options = this.state.autocompleteFiltered.map((option: string) => {
				return <li key={option}>{option}</li>;
			});
			return (
					<div className="row" key={this.props.item.key}>
						
						<input className="col-xs-12" value={this.state.text} 
							onChange={ this.handleChangeAutocomplete.bind(this) }
							onFocus={ () => { this.setState({ editMode: true }); } } 
							onBlur={ this.autocomplete.bind(this) } />	
						
						{ this.state.editMode ?
						<ul className="col-xs-12">
							{options}
						</ul>
						: null }
					
					</div>
					);
		}
	}





	export interface SmartTextAreaProps {
		text: string;
		autocompleteSource: string[];
	}
	export interface SmartTextAreaState {
		mutable?: string;
		autocompleteFiltered?: string[];
	}
	export class SmartTextArea extends React.Component<SmartTextAreaProps, SmartTextAreaState> {
		constructor(props: SmartTextAreaProps) {
			super(props);
			this.state = { 
				mutable: props.text,
		       		autocompleteFiltered: []
			};	
		}
		componentWillReceiveProps(nextProps: SmartTextAreaProps) {
			if(this.state.mutable !== nextProps.text) this.setState({ mutable: nextProps.text });
		}
		handleChange(e: Event) {
			console.log(e.target);
			var text = (e.target as HTMLDivElement).innerHTML;
			var lines = text.split('\n');
			var lastLine = lines.length > 0 ? lines[lines.length-1] : '';
			var filtered = this.filter(lastLine);
			this.setState({ mutable: text, autocompleteFiltered: filtered });
		}
		handleKeyUp(e: any) {
			if(e.keyCode === 13) {
				var text = (e.target as HTMLInputElement).value;
				var lines = text.split('\n');
				var lastLine = lines.length > 1 ? lines[lines.length-2] : '';
				var filtered = this.filter(lastLine);
				if(filtered.length > 0) {
					var newText = '';
					for(var x = 0; x <= lines.length - 3; x++) {
						newText += lines[x] + '\n';
					}
					newText += filtered[0] + '\n';
					this.setState({ mutable: newText });
				}
			}
		}
		filter(partial: string): string[] {
			var filtered = this.props.autocompleteSource.filter((option: string) => {
				return option.toLowerCase().indexOf(partial.toLowerCase()) !== -1;
			});
			return filtered;
		}
		render() {
			var options = this.state.autocompleteFiltered.map((option: string) => {
				return <li>{option}</li>;
			});
			return (
					<div className="row">
						
						<ul>
							{options}
						</ul>
					
					</div>
					);
		}
	}
}



$(document).ready(() => {
	// document.addEventListener('deviceready', () => {
	console.log('documentready');
	React.initializeTouchEvents(true);
	React.render(React.createElement(Views.Main, null), document.body);
});
