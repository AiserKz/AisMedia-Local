declare module "nprogress" {
    interface NProgresssOptions {
        minimum?: number;
        template?: string;
        easing?: string;
        speed?: number;
        trickle?: number;
        trickleSpeed?: number;
        showSpinner?: boolean;
        parent?: string;
    }

    interface NProgress {
        configure(options: NProgresssOptions): NProgress;
        start(): NProgress;
        done(force?: boolean): NProgress;
        set(n: number): NProgress;
        inc(amount?: number): NProgress;
        trickle(): NProgress;
        isStarted(): boolean;
    }

    const nprogress: NProgress;
    export default nprogress;
}