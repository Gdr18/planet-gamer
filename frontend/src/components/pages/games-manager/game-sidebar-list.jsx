import { Link } from 'react-router-dom'

import { TbTrashXFilled, TbEdit } from 'react-icons/tb'

const GameSidebarList = ({ handleDeleteClick, handleEditClick, games }) => {
	const gamesList = games.map(game => {
		return (
			<div key={game.id} className='manager-item'>
				<div className='manager-img'>
					<Link to={`/g/${game.id}`}>
						<img src={game.imgUrl} />
					</Link>
				</div>

				<div className='title-manager-wrapper'>
					<Link to={`/g/${game.id}`}>
						<div className='title-manager'>{game.title}</div>
					</Link>

					<div className='actions-manager'>
						<a className='action-icon' onClick={() => handleEditClick(game)}>
							<TbEdit />
						</a>

						<a className='action-icon' onClick={() => handleDeleteClick(game)}>
							<TbTrashXFilled />
						</a>
					</div>
				</div>
			</div>
		)
	})

	return <div className='manager-sidebar-list-wrapper'>{gamesList}</div>
}

export default GameSidebarList
