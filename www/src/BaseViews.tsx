/// <reference path="./typings/tsd.d.ts" />


namespace BaseViews {

	export interface SyncViewState {
		isDirty?: boolean;
		mutable?: any;
		shouldFlash?: boolean; // for debugging visualization of rendering occurences
	}

	export class SyncView<P, S extends SyncViewState> extends React.Component<P, S> {
		name: string = 'SynceView'; //For debugging output
		immutableProp: string;
		      constructor(props: P, immutableProp: string = 'immutable') {
			      super(props);
			      this.immutableProp = immutableProp;
			      if(immutableProp) {
				this.state = {
					shouldFlash: true,
					isDirty: false,
					mutable: JSON.parse(JSON.stringify(props[immutableProp]))
				} as any;		
			      } else { 
			      	this.state = {} as S;
			      }
		      }
		      isShallowDiff(curr: any, next: any): boolean {
			      var equal = true;
			      if (curr === null || next === null || typeof curr !== 'object' || typeof next !== 'object') {
				      return curr !== next;
			      }
			      Object.keys(next).forEach((key) => {
				      if (typeof next[key] === 'function') {
					      //ignore functions
				      } else {
					      equal = equal && curr[key] === next[key];
				      }
				      });
			      return !equal;
		      }
		      shouldComponentUpdate(nextProps: P, nextState: S = null) {
			      var propsDiff = this.isShallowDiff(this.props, nextProps);
			      var stateDiff = nextState ? this.isShallowDiff(this.state, nextState) : false;
			      var shouldUpdate = propsDiff || stateDiff;
			      return shouldUpdate;
		      }
		      componentWillReceiveProps(nextProps: P, nextState: S) {
			      if(this.shouldComponentUpdate(nextProps, nextState)) {
				      var state = { shouldFlash: true, isDirty: false } as any;
				      if(this.immutableProp) {
						var immutable = nextProps[this.immutableProp];
					      	state.mutable = Utils.mutableCopy(immutable);
				      }
				      this.setState(state as any);
			      }
		      }
		      handleChange(mutableProp: string, fieldName: string, event: Event) {
			      var mutable = JSON.parse(JSON.stringify((this.state as any)[mutableProp]));
			      if (mutable[fieldName] !== (event.target as HTMLInputElement).value) {
				      mutable[fieldName] = (event.target as HTMLInputElement).value;
				      var nextState = { isDirty: true };
				      (nextState as any)[mutableProp] = mutable;
				      this.setState(nextState as any as S);
			      }
		      }
		      saveField(immutableProp: string, propName: string, e: React.FocusEvent) {
		      	      this.saveFieldHelper(immutableProp, propName, false, e);
		      }
		      saveNumberField(immutableProp: string, propName: string, e: React.FocusEvent) {
		      	      this.saveFieldHelper(immutableProp, propName, true, e);
		      }
		      saveFieldHelper(immutableProp: string, propName: string, isNumber: boolean, e: React.FocusEvent) {
		      	      var val = (e.target as HTMLInputElement).value;
			      var value = isNumber ? parseFloat(val) : val;
			      this.props[immutableProp].set(propName, value);
		      }

		      preRender(classNames: string[] = []): string[] {
			      classNames.push('flash');
			      if(this.state.shouldFlash) {
				      classNames.push('glow');
				      setTimeout(() => { this.setState({ shouldFlash: false } as any); }, 200);
			      }
			      return classNames;
		      }
	}






	export class SimpleConfirmView extends React.Component<any, any> {
		doCallback(name: string) {
			if (this.props[name]) this.props[name]();
		}
		render() {

			var hide = { display: this.props.onRemove ? 'block' : 'none' };
			var style = {
			clear: 'both',
			margin: '10px',
			minHeight: '40px',
			position: 'absolute',
			bottom: 0,
			left: 0
			};

			return (
					<div style={style}>
					<Button className="col-4 btn-confirm" onClick={() => { this.doCallback('onSave'); } } disabled={!this.props.isDirty}>Save</Button>
					<Button className="col-4 btn-cancel" onClick={() => { this.doCallback('onCancel'); } }>Cancel</Button>
					<Button className="col-4 btn-delete" onClick={() => { this.doCallback('onRemove'); } } style={hide}>Delete</Button>
					</div>
			       );
		}
	}


	export interface ButtonProps {
		onClick: (e: React.MouseEvent) => void;
		className?: string;
		style?: any;
		children?: any;
		disabled?: boolean;
	}
	export interface ButtonState {
		isPressed?: boolean;
	}
	export class Button extends React.Component<ButtonProps, ButtonState> {
		constructor(props: ButtonProps) {
			super(props);
			this.state = {
				isPressed: false
			}
		}
		handleClick(e: React.MouseEvent) {
			this.setState({ isPressed: true });
			setTimeout(() => { this.setState({ isPressed: false }) }, 100); // set ms to twice the transition for in and out.
			if (this.props.onClick) this.props.onClick(e);
		}
		render() {
			var classes = this.props.className || "";
			classes = 'btn ' + classes + (this.state.isPressed ? ' pressed' : '');
			return (
					<button className={classes} style={this.props.style} onClick={(e) => { this.handleClick(e) } }>{this.props.children}</button>
			       );
		}

	}




	export interface ModalViewProps {
		ref?: string;
		children?: any;
		onShown?: () => void;
	}
	export interface ModalViewState {
		isVisible: boolean;
	}
	export class ModalView extends React.Component<ModalViewProps, ModalViewState> {
		constructor(props: ModalViewProps) {
			super(props);
			this.state = {
				isVisible: false
			};
		}
		show(callback?: () => void) {
			this.setState({
				isVisible: true
			}, () => {
				if(callback) callback();
				if (this.props.onShown) this.props.onShown()
			});
		}
		hide() {
			this.setState({
				isVisible: false
			});
		}
		toggle() {
			this.setState({
				isVisible: !this.state.isVisible
			}, () => {
				if (this.state.isVisible && this.props.onShown) { this.props.onShown(); }
			});
		}
		render() {
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
			return (
					<div style={backdropStyle}>
					<div style={innerStyle}>
					{ this.props.children }
					</div>
					</div>
			       );
		}
	}

	export interface SmartInputProps<T> {
		immutable: T;
		prop: string;
		isNumber?: boolean;
	}
	export interface SmartInputState<T> {
		mutable?: T;
		isDirty?: boolean;
	}
	export class SmartInput<T extends SyncNode.ISyncNode> extends React.Component<SmartInputProps<T>, SmartInputState<T>> {
		constructor(props: SmartInputProps<T>) {
			super(props);
			this.state = {
				mutable: Utils.mutableCopy(props.immutable),
				isDirty: false
			}
		}
		componentWillReceiveProps(nextProps: SmartInputProps<T>) {
			var state: SmartInputState<T> = { 
				isDirty: false,
				mutable: Utils.mutableCopy(nextProps.immutable)
			};
		      	this.setState(state);
	      	}

		handleChange(event: Event) {
			var val = (event.target as HTMLInputElement).value;
			var mutable = Utils.mutableCopy(this.state.mutable);
			var prop = this.props.prop;
			if (mutable[prop] !== val) {
	 	        	mutable[prop] = val;
	 	        	var nextState = { isDirty: true, mutable: mutable };
				this.setState(nextState as SmartInputState<T>);
			}
		}
		save(e: React.FocusEvent) {
			if(this.state.isDirty) {
				var val = (e.target as HTMLInputElement).value;
		      		var value = this.props.isNumber ? parseFloat(val) : val;
				this.props.immutable.set(this.props.prop, value);
			}
		}
		render() {
			return <input value={this.state.mutable[this.props.prop]} onChange={this.handleChange.bind(this)} onBlur={this.save.bind(this)}/>;
		}
	}

}
