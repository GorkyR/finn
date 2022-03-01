export interface Transaction {
	date: Date | string;
	concept: string;
	details: string;
	amount: number;
	tags: string[];
}

export interface Period {
	month: number;
	year: number;
}

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export function period_to_string(period: Period | null | undefined) {
	return `${months[period?.month ?? 0]} ${period?.year}`;
}