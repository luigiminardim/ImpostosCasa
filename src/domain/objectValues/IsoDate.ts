export class IsoDate {
  private year: number;
  private month: number;
  private day: number;

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  static fromString(dateStr: string): IsoDate {
    const [yearStr, monthStr, dayStr] = dateStr.split("-");
    if (!yearStr || !monthStr || !dayStr) {
      throw new Error(`${dateStr} não é uma data válida no formato yyyy-mm-dd`);
    }
    const year = Number.parseInt(yearStr);
    const month = Number.parseInt(monthStr);
    const day = Number.parseInt(dayStr);
    return new IsoDate(year, month, day);
  }

  static today(): IsoDate {
    const date = new Date();
    return new IsoDate(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate()
    );
  }

  toString(): string {
    const dayString = this.day < 10 ? `0${this.day}` : this.day;
    const monthString = this.month < 10 ? `0${this.month}` : this.month;
    return `${this.year.toString()}-${monthString}-${dayString}`;
  }

  valueOf(): string {
    return this.toString();
  }

  equals(other: unknown): boolean {
    if (other instanceof IsoDate) {
      return (
        this.year === other.year &&
        this.month === other.month &&
        this.day === other.day
      );
    }
    return false;
  }
}
