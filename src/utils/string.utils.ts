export function titlecase(text: string, language: 'es' | 'en' = 'es'): string {
	if (!text || text.length <= 1) return text?.toUpperCase()

	text = text
		.split(' ')
		.map((word) =>
			word.length <= 1 ? word.toUpperCase() : word[0]!.toUpperCase() + word.substring(1).toLowerCase()
		)
		.join(' ')

	function decapitalize(text: string, words: string[]) {
		for (let word of words) text = text.replaceAll(` ${word} `, ` ${word.toLowerCase()} `)
		return text
	}

	switch (language) {
		case 'en':
			return decapitalize(text, ['Of', 'And', 'A', 'An', 'The', 'But', 'For', 'At', 'By', 'To'])
		case 'es':
			return decapitalize(text, [
				'Un',
				'Una',
				'La',
				'Los',
				'Las',
				'El',
				'Y',
				'De',
				'Del',
				'Pero',
				'Para',
				'En',
				'Por',
				'Desde',
				'Hasta',
			])
	}
}
