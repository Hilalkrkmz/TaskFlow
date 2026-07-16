function Header({
    totalTasks,
    completedTasks,
    remainingTasks
}){
    return (
        <header className="header">
          <h1>TaskFlow</h1>
          <p>Görevlerini yönet</p>
          <div className="counter">
          Toplam: {totalTasks} |
          Tamamlanan: {completedTasks} |
          Kalan: {remainingTasks}
         </div>
    </header>
    );
}
export default Header;