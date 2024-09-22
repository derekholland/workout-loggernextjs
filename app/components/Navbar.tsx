import Link from 'next/link';

const Navbar = () => {
	return (
		<nav className='bg-gray-800 p-4 mb-10'>
			<div className='container mx-auto flex justify-between items-center'>
				<Link href='/' className='text-white text-xl font-bold'>
					Home
				</Link>
				<div className='flex space-x-4'>
					<Link href='/workout' className='text-gray-300 hover:text-white'>
						New Workout
					</Link>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
