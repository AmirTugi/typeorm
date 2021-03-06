import {QueryRunner} from "./QueryRunner";
import {Driver} from "../driver/Driver";

/**
 * Represents functionality to provide a new query runners, and release old ones.
 * Also can provide always same query runner.
 */
export class QueryRunnerProvider {

    // -------------------------------------------------------------------------
    // Protected Properties
    // -------------------------------------------------------------------------

    protected reusableQueryRunner: QueryRunner;

    /**
     * Indicates if this entity manager is released.
     * Entity manager can be released only if custom queryRunnerProvider is provided.
     * Once entity manager is released, its repositories and some other methods can't be used anymore.
     */
    protected _isReleased: boolean;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(protected driver: Driver,
                protected useSingleQueryRunner: boolean = false) {
    }

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    get isReleased() {
        return this._isReleased;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Provides a new query runner used to run repository queries.
     * If use useSingleQueryRunner mode is enabled then reusable query runner will be provided instead.
     */
    async provide(): Promise<QueryRunner> {
        if (this.useSingleQueryRunner) {
            if (!this.reusableQueryRunner)
                this.reusableQueryRunner = await this.driver.createQueryRunner();

            return this.reusableQueryRunner;
        }

        return this.driver.createQueryRunner();
    }

    /**
     * Query runner release logic extracted into separated methods intently,
     * to make possible to create a subclass with its own release query runner logic.
     * Note: release only query runners that provided by a provideQueryRunner() method.
     * This is important and by design.
     */
    async release(queryRunner: QueryRunner): Promise<void> {
        if (queryRunner === this.reusableQueryRunner)
            return;

        return queryRunner.release();
    }

    /**
     * Releases reused query runner.
     */
    async releaseReused(): Promise<void> {
        this._isReleased = true;
        if (this.reusableQueryRunner)
            return this.reusableQueryRunner.release();
    }

}