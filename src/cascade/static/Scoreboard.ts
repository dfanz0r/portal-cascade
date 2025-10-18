// src/cascade/static/Scoreboard.ts
// Static utility namespace for scoreboard configuration

/**
 * Static utility namespace for scoreboard operations.
 * Provides methods for configuring custom scoreboards.
 */
export namespace Scoreboard {
    /**
     * Sets the type of scoreboard to display.
     * @param scoreboardType The type of scoreboard.
     */
    export function setType(scoreboardType: mod.ScoreboardType): void {
        mod.SetScoreboardType(scoreboardType);
    }

    /**
     * Sets the header of the scoreboard with team names.
     * @param team1Name The name for team 1.
     * @param team2Name The name for team 2.
     */
    export function setHeader(
        team1Name: mod.Message,
        team2Name: mod.Message
    ): void {
        mod.SetScoreboardHeader(team1Name, team2Name);
    }

    /**
     * Sets the header of the scoreboard with a single name.
     * @param headerName The header name.
     */
    export function setHeaderSingle(headerName: mod.Message): void {
        mod.SetScoreboardHeader(headerName);
    }

    /**
     * Sets the column names for all 5 columns.
     * @param col1 Column 1 name.
     * @param col2 Column 2 name.
     * @param col3 Column 3 name.
     * @param col4 Column 4 name.
     * @param col5 Column 5 name.
     */
    export function setColumnNames(
        col1: mod.Message,
        col2: mod.Message,
        col3: mod.Message,
        col4: mod.Message,
        col5: mod.Message
    ): void {
        mod.SetScoreboardColumnNames(col1, col2, col3, col4, col5);
    }

    /**
     * Sets the column names for 4 columns.
     * @param col1 Column 1 name.
     * @param col2 Column 2 name.
     * @param col3 Column 3 name.
     * @param col4 Column 4 name.
     */
    export function setColumnNames4(
        col1: mod.Message,
        col2: mod.Message,
        col3: mod.Message,
        col4: mod.Message
    ): void {
        mod.SetScoreboardColumnNames(col1, col2, col3, col4);
    }

    /**
     * Sets the column names for 3 columns.
     * @param col1 Column 1 name.
     * @param col2 Column 2 name.
     * @param col3 Column 3 name.
     */
    export function setColumnNames3(
        col1: mod.Message,
        col2: mod.Message,
        col3: mod.Message
    ): void {
        mod.SetScoreboardColumnNames(col1, col2, col3);
    }

    /**
     * Sets the column names for 2 columns.
     * @param col1 Column 1 name.
     * @param col2 Column 2 name.
     */
    export function setColumnNames2(
        col1: mod.Message,
        col2: mod.Message
    ): void {
        mod.SetScoreboardColumnNames(col1, col2);
    }

    /**
     * Sets the column name for 1 column.
     * @param col1 Column 1 name.
     */
    export function setColumnNames1(col1: mod.Message): void {
        mod.SetScoreboardColumnNames(col1);
    }

    /**
     * Sets the relative widths of all 5 columns.
     * @param col1Width Column 1 width.
     * @param col2Width Column 2 width.
     * @param col3Width Column 3 width.
     * @param col4Width Column 4 width.
     * @param col5Width Column 5 width.
     */
    export function setColumnWidths(
        col1Width: number,
        col2Width: number,
        col3Width: number,
        col4Width: number,
        col5Width: number
    ): void {
        mod.SetScoreboardColumnWidths(
            col1Width,
            col2Width,
            col3Width,
            col4Width,
            col5Width
        );
    }

    /**
     * Sets the relative widths of 4 columns.
     * @param col1Width Column 1 width.
     * @param col2Width Column 2 width.
     * @param col3Width Column 3 width.
     * @param col4Width Column 4 width.
     */
    export function setColumnWidths4(
        col1Width: number,
        col2Width: number,
        col3Width: number,
        col4Width: number
    ): void {
        mod.SetScoreboardColumnWidths(
            col1Width,
            col2Width,
            col3Width,
            col4Width
        );
    }

    /**
     * Sets the relative widths of 3 columns.
     * @param col1Width Column 1 width.
     * @param col2Width Column 2 width.
     * @param col3Width Column 3 width.
     */
    export function setColumnWidths3(
        col1Width: number,
        col2Width: number,
        col3Width: number
    ): void {
        mod.SetScoreboardColumnWidths(col1Width, col2Width, col3Width);
    }

    /**
     * Sets the relative widths of 2 columns.
     * @param col1Width Column 1 width.
     * @param col2Width Column 2 width.
     */
    export function setColumnWidths2(
        col1Width: number,
        col2Width: number
    ): void {
        mod.SetScoreboardColumnWidths(col1Width, col2Width);
    }

    /**
     * Sets the relative width of 1 column.
     * @param col1Width Column 1 width.
     */
    export function setColumnWidths1(col1Width: number): void {
        mod.SetScoreboardColumnWidths(col1Width);
    }

    /**
     * Sets the player scores for all 5 columns.
     * @param player The player.
     * @param col1 Column 1 value.
     * @param col2 Column 2 value.
     * @param col3 Column 3 value.
     * @param col4 Column 4 value.
     * @param col5 Column 5 value.
     */
    export function setPlayerValues(
        player: mod.Player,
        col1: number,
        col2: number,
        col3: number,
        col4: number,
        col5: number
    ): void {
        mod.SetScoreboardPlayerValues(player, col1, col2, col3, col4, col5);
    }

    /**
     * Sets the player scores for 4 columns.
     * @param player The player.
     * @param col1 Column 1 value.
     * @param col2 Column 2 value.
     * @param col3 Column 3 value.
     * @param col4 Column 4 value.
     */
    export function setPlayerValues4(
        player: mod.Player,
        col1: number,
        col2: number,
        col3: number,
        col4: number
    ): void {
        mod.SetScoreboardPlayerValues(player, col1, col2, col3, col4);
    }

    /**
     * Sets the player scores for 3 columns.
     * @param player The player.
     * @param col1 Column 1 value.
     * @param col2 Column 2 value.
     * @param col3 Column 3 value.
     */
    export function setPlayerValues3(
        player: mod.Player,
        col1: number,
        col2: number,
        col3: number
    ): void {
        mod.SetScoreboardPlayerValues(player, col1, col2, col3);
    }

    /**
     * Sets the player scores for 2 columns.
     * @param player The player.
     * @param col1 Column 1 value.
     * @param col2 Column 2 value.
     */
    export function setPlayerValues2(
        player: mod.Player,
        col1: number,
        col2: number
    ): void {
        mod.SetScoreboardPlayerValues(player, col1, col2);
    }

    /**
     * Sets the player score for 1 column.
     * @param player The player.
     * @param col1 Column 1 value.
     */
    export function setPlayerValues1(player: mod.Player, col1: number): void {
        mod.SetScoreboardPlayerValues(player, col1);
    }

    /**
     * Sets the sorting column and order for the scoreboard.
     * @param sortingColumn The column to sort by.
     * @param reverseSorting Whether to reverse the sorting order.
     */
    export function setSorting(
        sortingColumn: number,
        reverseSorting: boolean
    ): void {
        mod.SetScoreboardSorting(sortingColumn, reverseSorting);
    }

    /**
     * Sets the sorting column for the scoreboard.
     * @param sortingColumn The column to sort by.
     */
    export function setSortingColumn(sortingColumn: number): void {
        mod.SetScoreboardSorting(sortingColumn);
    }
}
