
import { NavLink } from "react-router-dom"

const SiteHeader = () => {
  return (
    <header className="w-full border-b border-gray-500 px-12">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <NavLink to="/" className="text-2xl font-bold text-blue-500">
          <div className={`flex items-center size-[40px]`}>
              <img src="/logo/seni.png" className={`transition-all `}
            alt="" />
              <div
                className={`flex flex-col justify-end truncate`}
              >
              
              </div>  <span className="text-[#000] text-sm capitalize font-normal">
                  Together We Care
                </span>
            </div>
          </NavLink>
        </div>
        <div className="flex-1 max-w-xl px-4">
        </div>
        {/* <nav className="flex items-center space-x-4">
       
          <Button variant="ghost" size="sm">
            Log in
          </Button>
          <Button size="sm">Sign up</Button>
        </nav> */}
      </div>
    </header>
  )
}

export default SiteHeader
