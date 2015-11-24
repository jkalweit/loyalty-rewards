/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseViews;
(function (BaseViews) {
    var SyncView = (function (_super) {
        __extends(SyncView, _super);
        function SyncView(props, immutableProp) {
            if (immutableProp === void 0) { immutableProp = 'immutable'; }
            _super.call(this, props);
            this.name = 'SynceView'; //For debugging output
            this.immutableProp = immutableProp;
            if (immutableProp) {
                this.state = {
                    shouldFlash: true,
                    isDirty: false,
                    mutable: JSON.parse(JSON.stringify(props[immutableProp]))
                };
            }
            else {
                this.state = {};
            }
        }
        SyncView.prototype.isShallowDiff = function (curr, next) {
            var equal = true;
            if (curr === null || next === null || typeof curr !== 'object' || typeof next !== 'object') {
                return curr !== next;
            }
            Object.keys(next).forEach(function (key) {
                if (typeof next[key] === 'function') {
                }
                else {
                    equal = equal && curr[key] === next[key];
                }
            });
            return !equal;
        };
        SyncView.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            if (nextState === void 0) { nextState = null; }
            var propsDiff = this.isShallowDiff(this.props, nextProps);
            var stateDiff = nextState ? this.isShallowDiff(this.state, nextState) : false;
            var shouldUpdate = propsDiff || stateDiff;
            return shouldUpdate;
        };
        SyncView.prototype.componentWillReceiveProps = function (nextProps, nextState) {
            if (this.shouldComponentUpdate(nextProps, nextState)) {
                var state = { shouldFlash: true, isDirty: false };
                if (this.immutableProp) {
                    var immutable = nextProps[this.immutableProp];
                    state.mutable = Utils.mutableCopy(immutable);
                }
                this.setState(state);
            }
        };
        SyncView.prototype.handleChange = function (mutableProp, fieldName, event) {
            var mutable = JSON.parse(JSON.stringify(this.state[mutableProp]));
            if (mutable[fieldName] !== event.target.value) {
                mutable[fieldName] = event.target.value;
                var nextState = { isDirty: true };
                nextState[mutableProp] = mutable;
                this.setState(nextState);
            }
        };
        SyncView.prototype.saveField = function (immutableProp, propName, e) {
            this.saveFieldHelper(immutableProp, propName, false, e);
        };
        SyncView.prototype.saveNumberField = function (immutableProp, propName, e) {
            this.saveFieldHelper(immutableProp, propName, true, e);
        };
        SyncView.prototype.saveFieldHelper = function (immutableProp, propName, isNumber, e) {
            var val = e.target.value;
            var value = isNumber ? parseFloat(val) : val;
            this.props[immutableProp].set(propName, value);
        };
        SyncView.prototype.preRender = function (classNames) {
            var _this = this;
            if (classNames === void 0) { classNames = []; }
            classNames.push('flash');
            if (this.state.shouldFlash) {
                classNames.push('glow');
                setTimeout(function () { _this.setState({ shouldFlash: false }); }, 200);
            }
            return classNames;
        };
        return SyncView;
    })(React.Component);
    BaseViews.SyncView = SyncView;
    var SimpleConfirmView = (function (_super) {
        __extends(SimpleConfirmView, _super);
        function SimpleConfirmView() {
            _super.apply(this, arguments);
        }
        SimpleConfirmView.prototype.doCallback = function (name) {
            if (this.props[name])
                this.props[name]();
        };
        SimpleConfirmView.prototype.render = function () {
            var _this = this;
            var hide = { display: this.props.onRemove ? 'block' : 'none' };
            var style = {
                clear: 'both',
                margin: '10px',
                minHeight: '40px',
                position: 'absolute',
                bottom: 0,
                left: 0
            };
            return (React.createElement("div", {"style": style}, React.createElement(Button, {"className": "col-4 btn-confirm", "onClick": function () { _this.doCallback('onSave'); }, "disabled": !this.props.isDirty}, "Save"), React.createElement(Button, {"className": "col-4 btn-cancel", "onClick": function () { _this.doCallback('onCancel'); }}, "Cancel"), React.createElement(Button, {"className": "col-4 btn-delete", "onClick": function () { _this.doCallback('onRemove'); }, "style": hide}, "Delete")));
        };
        return SimpleConfirmView;
    })(React.Component);
    BaseViews.SimpleConfirmView = SimpleConfirmView;
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(props) {
            _super.call(this, props);
            this.state = {
                isPressed: false
            };
        }
        Button.prototype.handleClick = function (e) {
            var _this = this;
            this.setState({ isPressed: true });
            setTimeout(function () { _this.setState({ isPressed: false }); }, 100); // set ms to twice the transition for in and out.
            if (this.props.onClick)
                this.props.onClick(e);
        };
        Button.prototype.render = function () {
            var _this = this;
            var classes = this.props.className || "";
            classes = 'btn ' + classes + (this.state.isPressed ? ' pressed' : '');
            return (React.createElement("button", {"className": classes, "style": this.props.style, "onClick": function (e) { _this.handleClick(e); }}, this.props.children));
        };
        return Button;
    })(React.Component);
    BaseViews.Button = Button;
    var ModalView = (function (_super) {
        __extends(ModalView, _super);
        function ModalView(props) {
            _super.call(this, props);
            this.state = {
                isVisible: false
            };
        }
        ModalView.prototype.show = function (callback) {
            var _this = this;
            this.setState({
                isVisible: true
            }, function () {
                if (callback)
                    callback();
                if (_this.props.onShown)
                    _this.props.onShown();
            });
        };
        ModalView.prototype.hide = function () {
            this.setState({
                isVisible: false
            });
        };
        ModalView.prototype.toggle = function () {
            var _this = this;
            this.setState({
                isVisible: !this.state.isVisible
            }, function () {
                if (_this.state.isVisible && _this.props.onShown) {
                    _this.props.onShown();
                }
            });
        };
        ModalView.prototype.render = function () {
            var backdropStyle = {
                display: this.state.isVisible ? 'block' : 'none',
                position: 'fixed',
                top: '50px',
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 2,
                backgroundColor: 'rgba(0,0,0,0.5)'
            };
            var innerStyle = {
                borderRadius: '5px',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                minWidth: '400px',
                maxWidth: '600px',
                width: '80%',
                margin: '20px auto',
                padding: '40px',
                zIndex: 11
            };
            return (React.createElement("div", {"style": backdropStyle}, React.createElement("div", {"style": innerStyle}, this.props.children)));
        };
        return ModalView;
    })(React.Component);
    BaseViews.ModalView = ModalView;
    var SmartInput = (function (_super) {
        __extends(SmartInput, _super);
        function SmartInput(props) {
            _super.call(this, props);
            this.state = {
                mutable: Utils.mutableCopy(props.immutable),
                isDirty: false
            };
        }
        SmartInput.prototype.componentWillReceiveProps = function (nextProps) {
            var state = {
                isDirty: false,
                mutable: Utils.mutableCopy(nextProps.immutable)
            };
            this.setState(state);
        };
        SmartInput.prototype.handleChange = function (event) {
            var val = event.target.value;
            var mutable = Utils.mutableCopy(this.state.mutable);
            var prop = this.props.prop;
            if (mutable[prop] !== val) {
                mutable[prop] = val;
                var nextState = { isDirty: true, mutable: mutable };
                this.setState(nextState);
            }
        };
        SmartInput.prototype.save = function (e) {
            if (this.state.isDirty) {
                var val = e.target.value;
                var value = this.props.isNumber ? parseFloat(val) : val;
                this.props.immutable.set(this.props.prop, value);
            }
        };
        SmartInput.prototype.render = function () {
            return React.createElement("input", {"value": this.state.mutable[this.props.prop], "onChange": this.handleChange.bind(this), "onBlur": this.save.bind(this)});
        };
        return SmartInput;
    })(React.Component);
    BaseViews.SmartInput = SmartInput;
})(BaseViews || (BaseViews = {}));
//# sourceMappingURL=BaseViews.js.map