/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./Utils.ts" />
/// <reference path="./SyncNode.ts" />
/// <reference path="./SyncNodeSocket.ts" />
/// <reference path="./BaseViews.tsx" />
/// <reference path="./Models.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Views;
(function (Views) {
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main(props) {
            var _this = this;
            _super.call(this, props);
            this.ticket = {
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
            };
            var data = { loyaltyMembers: {}, employees: {}, shifts: {} };
            document.addEventListener('deviceready', function () {
                console.log('	deviceready 4');
                var sync = new SyncNodeSocket.SyncNodeSocket('data', data, 'http://localhost:1337');
                //var sync = new SyncNodeSocket.SyncNodeSocket('shifts', data, 'http://timeclocker.azurewebsites.net');
                sync.onUpdated(function (updated) {
                    console.log('updated data!', updated);
                    var newState = { db: updated };
                    if (_this.state.selected)
                        newState.selected = updated.loyaltyMembers[_this.state.selected.key];
                    _this.setState(newState, function () { _this.updateFiltered(); });
                });
            });
            this.state = { db: data, selected: null, filter: '', filtered: [] };
        }
        Main.prototype.edit = function (item) {
            this.setState({ selected: item });
        };
        Main.prototype.updateFilter = function (e) {
            var _this = this;
            this.setState({ filter: e.target.value }, function () { _this.updateFiltered(); });
        };
        Main.prototype.updateFiltered = function () {
            var _this = this;
            var filtered = Utils.toArray(this.state.db.loyaltyMembers, "name");
            if (this.state.filter !== '') {
                filtered = filtered.filter(function (member) {
                    return member.name.toLowerCase().indexOf(_this.state.filter.trim().toLowerCase()) !== -1;
                });
            }
            this.setState({ filtered: filtered });
        };
        Main.prototype.handleKeyUp = function (e) {
            var _this = this;
            if (e.keyCode === 13) {
                var newMember = {
                    key: new Date().toISOString(),
                    name: this.state.filter,
                    phone: '',
                    note: '',
                    points: {}
                };
                var result = this.state.db.loyaltyMembers.set(newMember.key, newMember);
                this.setState({ filter: '', selected: result.value }, function () { _this.updateFiltered(); });
            }
        };
        Main.prototype.render = function () {
            var _this = this;
            var members = this.state.filtered.map(function (member) {
                var classes = "row";
                if (_this.state.selected && _this.state.selected.key === member.key) {
                    classes += " selected";
                }
                return React.createElement("div", {"key": member.key, "className": classes, "onClick": function () { _this.setState({ selected: member }); }}, React.createElement("div", {"className": "col-sm-12"}, member.name));
            });
            return (React.createElement("div", null, React.createElement(TicketView, {"ticket": this.ticket}), React.createElement("h1", null, "Loyalty Members"), React.createElement("input", {"value": this.state.filter, "onChange": this.updateFilter.bind(this), "onKeyUp": this.handleKeyUp.bind(this)}), members, this.state.selected ?
                React.createElement(LoyaltyMemberView, {"member": this.state.selected})
                : null));
        };
        return Main;
    })(React.Component);
    Views.Main = Main;
    var LoyaltyMemberView = (function (_super) {
        __extends(LoyaltyMemberView, _super);
        function LoyaltyMemberView(props) {
            _super.call(this, props, 'member');
            this.state.newPoints = {};
        }
        LoyaltyMemberView.prototype.addPoints = function () {
            var points = {
                key: new Date().toISOString(),
                type: this.refs['type'].getDOMNode().value,
                amount: parseFloat(this.refs['amount'].getDOMNode().value)
            };
            var result = this.props.member.points.set(points.key, points);
            this.setState({ selected: result.value });
        };
        LoyaltyMemberView.prototype.componentWillReceiveProps = function (nextProps, nextState) {
            if (this.shouldComponentUpdate(nextProps, nextState)) {
                if (this.state.selected) {
                    this.setState({ selected: nextProps.member.points[this.state.selected.key] });
                }
            }
            _super.prototype.componentWillReceiveProps.call(this, nextProps, nextState);
        };
        LoyaltyMemberView.prototype.render = function () {
            var _this = this;
            var pointsArray = Utils.toArray(this.props.member.points);
            var totalPoints = 0;
            var points = pointsArray.map(function (point) {
                totalPoints += point.type === 'Redeem' ? point.amount * -1 : point.amount;
                var className = 'row';
                if (_this.state.selected && _this.state.selected.key === point.key)
                    className += ' selected';
                if (point.type === 'Redeem')
                    className += ' green';
                return React.createElement("div", {"key": point.key, "className": className, "onClick": function () { _this.setState({ selected: point }); }}, React.createElement("div", {"className": "col-xs-3"}, point.type), React.createElement("div", {"className": "col-xs-3"}, point.amount));
            });
            var member = this.state.mutable;
            return (React.createElement("div", null, React.createElement("h2", null, member.name), React.createElement("button", {"onClick": function () { if (confirm('Delete member?'))
                _this.props.member.parent.remove(member.key); }}, "x"), React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "col-xs-3"}, "Name:"), React.createElement("div", {"className": "col-xs-3"}, React.createElement("input", {"value": member.name, "onChange": this.handleChange.bind(this, 'mutable', 'name'), "onBlur": this.saveField.bind(this, 'member', 'name')}))), React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "col-xs-3"}, "Since:"), React.createElement("div", {"className": "col-xs-3"}, Utils.formatDateFromKey(member.key))), React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "col-xs-3"}, "Points:"), React.createElement("div", {"className": "col-xs-3"}, Utils.formatCurrency(totalPoints))), React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "col-xs-3"}, "Phone:"), React.createElement("div", {"className": "col-xs-3"}, React.createElement("input", {"value": member.phone, "onChange": this.handleChange.bind(this, 'mutable', 'phone'), "onBlur": this.saveField.bind(this, 'member', 'phone')}))), React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "col-xs-3"}, "Note:"), React.createElement("div", {"className": "col-xs-3"}, React.createElement("input", {"value": member.note, "onChange": this.handleChange.bind(this, 'mutable', 'note'), "onBlur": this.saveField.bind(this, 'member', 'note')}))), React.createElement("div", {"className": "row"}, React.createElement("select", {"className": "col-xs-3", "ref": "type"}, React.createElement("option", null, "Dinner"), React.createElement("option", null, "Redeem")), React.createElement("input", {"className": "col-xs-2", "ref": "amount"}), React.createElement("button", {"className": "col-xs-2", "onClick": this.addPoints.bind(this)}, "Add")), points, this.state.selected ?
                React.createElement(LoyaltyMemberPointsView, {"immutable": this.state.selected})
                : null));
        };
        return LoyaltyMemberView;
    })(BaseViews.SyncView);
    Views.LoyaltyMemberView = LoyaltyMemberView;
    var LoyaltyMemberPointsView = (function (_super) {
        __extends(LoyaltyMemberPointsView, _super);
        function LoyaltyMemberPointsView(props) {
            _super.call(this, props, 'immutable');
        }
        LoyaltyMemberPointsView.prototype.render = function () {
            var points = this.props.immutable;
            return (React.createElement("div", null, React.createElement("button", {"onClick": function () { if (confirm('Delete pionts?'))
                points.parent.remove(points.key); }}, "x"), React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "col-xs-3"}, "Type:"), React.createElement("div", {"className": "col-xs-3"}, React.createElement(BaseViews.SmartInput, {"immutable": points, "prop": "type"}))), React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "col-xs-3"}, "Date:"), React.createElement("div", {"className": "col-xs-3"}, Utils.formatDateFromKey(points.key))), React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "col-xs-3"}, "Amount:"), React.createElement("div", {"className": "col-xs-3"}, React.createElement(BaseViews.SmartInput, {"immutable": points, "prop": "amount", "isNumber": true})))));
        };
        return LoyaltyMemberPointsView;
    })(BaseViews.SyncView);
    Views.LoyaltyMemberPointsView = LoyaltyMemberPointsView;
    var TicketView = (function (_super) {
        __extends(TicketView, _super);
        function TicketView(props) {
            _super.call(this, props, 'ticket');
        }
        TicketView.prototype.addItem = function (name) {
            var item = {
                key: new Date().toISOString(),
                name: name,
                price: 1,
                modifiers: {}
            };
            this.props.ticket.set(item.key, item);
            this.refs['newItemBox'].clear();
        };
        TicketView.prototype.render = function () {
            var items = Utils.toArray(this.props.ticket.items).map(function (item) {
                return React.createElement(TicketItemView, {"item": item});
            });
            return React.createElement("div", null, React.createElement("h2", null, "Ticket"), items, React.createElement(NewTicketItemView, {"ref": "newItemBox", "autocompleted": this.addItem.bind(this)}));
        };
        return TicketView;
    })(BaseViews.SyncView);
    Views.TicketView = TicketView;
    var NewTicketItemView = (function (_super) {
        __extends(NewTicketItemView, _super);
        function NewTicketItemView(props) {
            _super.call(this, props, null);
            this.source = [
                'Cheeseburger',
                'Hamburger',
                'French Fries',
                'Cole Slaw'
            ];
            this.state.autocompleteFiltered = [];
            this.state.text = '';
            this.state.editMode = false;
        }
        NewTicketItemView.prototype.handleChangeAutocomplete = function (e) {
            var text = e.target.value;
            var filtered = this.filter(text);
            this.setState({ text: text, autocompleteFiltered: filtered });
        };
        NewTicketItemView.prototype.autocomplete = function (e) {
            var filtered = this.state.autocompleteFiltered;
            if (filtered.length > 0) {
                var text = filtered[0];
                this.setState({ text: text });
                this.props.autocompleted(text);
            }
            this.setState({ editMode: false });
        };
        NewTicketItemView.prototype.filter = function (partial) {
            var filtered = this.source.filter(function (option) {
                return option.toLowerCase().indexOf(partial.toLowerCase()) !== -1;
            });
            return filtered;
        };
        NewTicketItemView.prototype.clear = function () {
            this.setState({ text: '' });
        };
        NewTicketItemView.prototype.render = function () {
            var _this = this;
            var options = this.state.autocompleteFiltered.map(function (option) {
                return React.createElement("li", {"key": option}, option);
            });
            return (React.createElement("div", {"className": "row"}, React.createElement("h1", null, "Hallo!"), React.createElement("input", {"className": "col-xs-12", "value": this.state.text, "onChange": this.handleChangeAutocomplete.bind(this), "onFocus": function () { _this.setState({ editMode: true }); }, "onBlur": this.autocomplete.bind(this)}), this.state.editMode ?
                React.createElement("ul", {"className": "col-xs-12"}, options)
                : null));
        };
        return NewTicketItemView;
    })(BaseViews.SyncView);
    Views.NewTicketItemView = NewTicketItemView;
    var TicketItemView = (function (_super) {
        __extends(TicketItemView, _super);
        function TicketItemView(props) {
            _super.call(this, props, 'item');
            this.source = [
                'Cheeseburger',
                'Hamburger',
                'French Fries',
                'Cole Slaw'
            ];
            this.state.autocompleteFiltered = [];
            this.state.text = this.props.item.name;
            this.state.editMode = false;
        }
        TicketItemView.prototype.handleChangeAutocomplete = function (e) {
            var text = e.target.value;
            var filtered = this.filter(text);
            this.setState({ text: text, autocompleteFiltered: filtered });
        };
        TicketItemView.prototype.autocomplete = function (e) {
            var filtered = this.state.autocompleteFiltered;
            if (filtered.length > 0) {
                this.setState({ text: filtered[0] });
            }
            this.setState({ editMode: false });
        };
        TicketItemView.prototype.filter = function (partial) {
            var filtered = this.source.filter(function (option) {
                return option.toLowerCase().indexOf(partial.toLowerCase()) !== -1;
            });
            return filtered;
        };
        TicketItemView.prototype.render = function () {
            var _this = this;
            var options = this.state.autocompleteFiltered.map(function (option) {
                return React.createElement("li", {"key": option}, option);
            });
            return (React.createElement("div", {"className": "row", "key": this.props.item.key}, React.createElement("input", {"className": "col-xs-12", "value": this.state.text, "onChange": this.handleChangeAutocomplete.bind(this), "onFocus": function () { _this.setState({ editMode: true }); }, "onBlur": this.autocomplete.bind(this)}), this.state.editMode ?
                React.createElement("ul", {"className": "col-xs-12"}, options)
                : null));
        };
        return TicketItemView;
    })(BaseViews.SyncView);
    Views.TicketItemView = TicketItemView;
    var SmartTextArea = (function (_super) {
        __extends(SmartTextArea, _super);
        function SmartTextArea(props) {
            _super.call(this, props);
            this.state = {
                mutable: props.text,
                autocompleteFiltered: []
            };
        }
        SmartTextArea.prototype.componentWillReceiveProps = function (nextProps) {
            if (this.state.mutable !== nextProps.text)
                this.setState({ mutable: nextProps.text });
        };
        SmartTextArea.prototype.handleChange = function (e) {
            console.log(e.target);
            var text = e.target.innerHTML;
            var lines = text.split('\n');
            var lastLine = lines.length > 0 ? lines[lines.length - 1] : '';
            var filtered = this.filter(lastLine);
            this.setState({ mutable: text, autocompleteFiltered: filtered });
        };
        SmartTextArea.prototype.handleKeyUp = function (e) {
            if (e.keyCode === 13) {
                var text = e.target.value;
                var lines = text.split('\n');
                var lastLine = lines.length > 1 ? lines[lines.length - 2] : '';
                var filtered = this.filter(lastLine);
                if (filtered.length > 0) {
                    var newText = '';
                    for (var x = 0; x <= lines.length - 3; x++) {
                        newText += lines[x] + '\n';
                    }
                    newText += filtered[0] + '\n';
                    this.setState({ mutable: newText });
                }
            }
        };
        SmartTextArea.prototype.filter = function (partial) {
            var filtered = this.props.autocompleteSource.filter(function (option) {
                return option.toLowerCase().indexOf(partial.toLowerCase()) !== -1;
            });
            return filtered;
        };
        SmartTextArea.prototype.render = function () {
            var options = this.state.autocompleteFiltered.map(function (option) {
                return React.createElement("li", null, option);
            });
            return (React.createElement("div", {"className": "row"}, React.createElement("ul", null, options)));
        };
        return SmartTextArea;
    })(React.Component);
    Views.SmartTextArea = SmartTextArea;
})(Views || (Views = {}));
$(document).ready(function () {
    // document.addEventListener('deviceready', () => {
    console.log('documentready');
    React.initializeTouchEvents(true);
    React.render(React.createElement(Views.Main, null), document.body);
});
//# sourceMappingURL=Views.js.map