
/** 
 * If TSX isn't needed, this formatter will escape raw content
 * e.g. `html<p>${<script>alert("oh no")</script>}</p>`
 */
export default function html(strings: TemplateStringsArray, ...values: any[]) {
	return strings.reduce((result, str, i) => {
		const value = i < values.length ? sanitiseHTML(values[i]) : '';
		return result + str + value;
	}, '');
}

const characterMap: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;',
	'/': '&#x2F;',
	'`': '&grave;',
	'=': '&#x3D;'
}

// Match any of the characters inside /[ ... ]/
const sanitiseRegex = /[&<>"'`=/]/g

function sanitiseHTML(value: string) {
	const stringValue = value.toString()

	return stringValue.replace(sanitiseRegex, match => characterMap[match])
}