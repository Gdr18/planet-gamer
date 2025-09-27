export default function Checkbox({ name, checked, setChecked, value }) {
	return (
		<div className='input-label-wrapper'>
			<input
				onChange={setChecked}
				type='checkbox'
				value={value}
				name={name}
				checked={checked}
				id={name}
			/>
			<label htmlFor={name}>{name}</label>
		</div>
	)
}
